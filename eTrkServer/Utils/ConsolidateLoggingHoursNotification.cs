using System.Data;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using NpgsqlTypes;

namespace eTrkServer.Utils
{
  public class ConsolidationHoursNotification : BackgroundService
  {
    private readonly IServiceScopeFactory _service;
    private readonly Serilog.ILogger _logger;
    private readonly int _executionHourUtc;
    private readonly int _executionMinuteUtc;
    private readonly int _executionSecondUtc;

    private readonly int AverageHours;

    public ConsolidationHoursNotification(
      IServiceScopeFactory service,
      IConfiguration configuration,
      Serilog.ILogger logger
    )
    {
      _service = service;
      _logger = logger;

      _executionHourUtc = configuration.GetValue<int>("ConsolidationAverageHours:ExecutionHourUtc");
      _executionMinuteUtc = configuration.GetValue<int>(
        "ConsolidationAverageHours:ExecutionMinuteUtc"
      );
      _executionSecondUtc = configuration.GetValue<int>(
        "ConsolidationAverageHours:ExecutionSecondUtc"
      );
      AverageHours = configuration.GetValue<int>("AverageHours:Hours");
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
      try
      {
        while (!stoppingToken.IsCancellationRequested)
        {
          var currentTime = DateTime.UtcNow;

          var executionTime = new DateTime(
            currentTime.Year,
            currentTime.Month,
            currentTime.Day,
            _executionHourUtc,
            _executionMinuteUtc,
            _executionSecondUtc
          );

          if (currentTime >= executionTime)
          {
            executionTime = executionTime.AddDays(1);
          }

          // Calculate the delay until the execution time
          var delay = executionTime - currentTime;

          // Wait until the execution time
          await Task.Delay(delay, stoppingToken);

          if (DateTime.UtcNow.DayOfWeek == DayOfWeek.Monday)
          {
            _logger.Information("Day of the day : " + DateTime.UtcNow.DayOfWeek);
            await LoggingHours();
          }
        }
      }
      catch (Exception ex)
      {
        _logger.Debug("Error in executing the method" + ex.Message);
        _logger.Information("Error in executing the method" + ex.InnerException);
      }
    }

    private async Task LoggingHours()
    {
      var scope = _service.CreateScope();

      AppDbContext _context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
      EmailService _emailService = scope.ServiceProvider.GetRequiredService<EmailService>();

      _logger.Information("Executing Consolidation Method");
      _logger.Information("currenttime : " + DateTime.UtcNow);

      NpgsqlConnection connection = new NpgsqlConnection(
        _context.Database.GetDbConnection().ConnectionString
      );

      List<string> noticeMessages = new List<string>();
      var currentDate = DateTime.Now.Date;
      var fromDate = new DateTime(currentDate.Year, currentDate.Month, currentDate.Day, 0, 0, 0);
      var toDate = new DateTime(currentDate.Year, currentDate.Month, currentDate.Day, 23, 59, 59);
      _logger.Information("Dates : " + fromDate + toDate);
      connection.Notice += (sender, e) =>
      {
        string noticeMessage = e.Notice.MessageText;
        _logger.Information(noticeMessage);
        noticeMessages.Add(noticeMessage);
      };
      var data = await _context.UserDatas.ToListAsync();
      var reporting = data.Select(u => u.ReportingIntoMail).Distinct();
      foreach (var report in reporting)
      {
        _logger.Information("reporting mail :" + report);
        try
        {
          connection.Open();
          using (
            NpgsqlCommand command = new NpgsqlCommand(
              "calculate_user_consolidation_reporting",
              connection
            )
          )
          {
            command.CommandType = CommandType.StoredProcedure;

            command.CommandTimeout = 2000;
            command.Parameters.Add(
              new NpgsqlParameter("p_user_activity_from_date", NpgsqlDbType.Timestamp)
              {
                Value = fromDate,
                DataTypeName = "timestamp without time zone"
              }
            );
            command.Parameters.Add(
              new NpgsqlParameter("p_user_activity_to_date", NpgsqlDbType.Timestamp)
              {
                Value = toDate,
                DataTypeName = "timestamp without time zone"
              }
            );
            command.Parameters.Add(
              new NpgsqlParameter("reporting_mail", NpgsqlDbType.Text) { Value = report }
            );
            noticeMessages.Clear();
            await command.ExecuteNonQueryAsync();

            var usersGroupedByEmail = noticeMessages
              .Select(message =>
              {
                var parts = message.Split(new[] { ", " }, StringSplitOptions.None);
                var date = parts[0].Split(new[] { ": " }, StringSplitOptions.None)[1];
                var displayName = parts[1].Split(new[] { ": " }, StringSplitOptions.None)[1];
                var email = parts[2].Split(new[] { ": " }, StringSplitOptions.None)[1].Trim();
                var reporting = parts[3].Split(new[] { ": " }, StringSplitOptions.None)[1].Trim();
                var workinghours = parts[4]
                  .Split(new[] { ": " }, StringSplitOptions.None)[1]
                  .Trim();
                var productivehours = parts[5]
                  .Split(new[] { ": " }, StringSplitOptions.None)[1]
                  .Trim();
                var unproductivehours = parts[6]
                  .Split(new[] { ": " }, StringSplitOptions.None)[1]
                  .Trim();
                var logginghours = parts[7]
                  .Split(new[] { ": " }, StringSplitOptions.None)[1]
                  .Trim();
                var idlehours = parts[8].Split(new[] { ": " }, StringSplitOptions.None)[1].Trim();

                return new
                {
                  Dates = date,
                  DisplayName = displayName,
                  Email = email,
                  ReportingTo = reporting,
                  WorkingHours = TimeSpan.Parse(workinghours),
                  ProductiveHours = TimeSpan.Parse(productivehours),
                  UnProductiveHours = TimeSpan.Parse(unproductivehours),
                  LoggedHours = TimeSpan.Parse(logginghours),
                  IdleHours = TimeSpan.Parse(idlehours),
                };
              })
              .GroupBy(user => user.ReportingTo);

            var allDates = usersGroupedByEmail
              .SelectMany(g => g.Select(user => DateTime.Parse(user.Dates)))
              .OrderBy(date => date)
              .ToList();

            // Get the first and last dates
            var firstDate = allDates.First();
            var lastDate = allDates.Last();

            // Format the dates
            string formattedFirstDate = firstDate.ToString("d MMMM yyyy");
            string formattedLastDate = lastDate.ToString("d MMMM yyyy");

            foreach (var group in usersGroupedByEmail)
            {
              var Email = group.Key;

              _logger.Information("email" + " " + Email);

              var emailBody = new StringBuilder();

              emailBody.AppendLine("<html><body>");

              foreach (var userGroup in group.GroupBy(user => user.DisplayName))
              {
                var userName = userGroup.Key;
                var weekdayshtml = new StringBuilder();
                var averagehourshtml = new StringBuilder();
                var weekendhtml = new StringBuilder();

                var validDays = userGroup
                  .Where(user =>
                    user.WorkingHours.TotalSeconds > 0
                    && user.LoggedHours.TotalSeconds > 0
                    && DateTime.Parse(user.Dates).DayOfWeek != DayOfWeek.Saturday
                    && DateTime.Parse(user.Dates).DayOfWeek != DayOfWeek.Sunday
                  )
                  .ToList();
                var weekdays = userGroup
                  .Where(user =>
                    DateTime.Parse(user.Dates).DayOfWeek != DayOfWeek.Saturday
                    && DateTime.Parse(user.Dates).DayOfWeek != DayOfWeek.Sunday
                  )
                  .ToList();
                var weekendDays = userGroup
                  .Where(user =>
                    DateTime.Parse(user.Dates).DayOfWeek == DayOfWeek.Saturday
                    || DateTime.Parse(user.Dates).DayOfWeek == DayOfWeek.Sunday
                  )
                  .ToList();

                weekdayshtml.AppendLine("<table border='1' style='border-collapse: collapse;'>");
                weekdayshtml.AppendLine(
                  "<tr style='background-color:#70AD47;padding:10px;color:#F6F5F5;font-size:16px;font-family:calibri;'>"
                );
                weekdayshtml.AppendLine("<th> Week Dates</th>");
                weekdayshtml.AppendLine("<th>Logged Hours</th>");
                weekdayshtml.AppendLine("<th>Working Hours</th>");
                weekdayshtml.AppendLine("<th>Productive Hours</th>");
                weekdayshtml.AppendLine("<th>Unproductive Hours</th>");
                weekdayshtml.AppendLine("<th>Idle Hours</th>");
                weekdayshtml.AppendLine("</tr>");
                // Include user information in the email body


                foreach (var user in weekdays)
                {
                  if (user != null)
                  {
                    //values
                    weekdayshtml.AppendLine(
                      "<tr style=padding:4px;font-size:16px;font-family:calibri;'>"
                    );
                    weekdayshtml.AppendLine($"<td style='text-align:center;'>{user.Dates}</td>");
                    weekdayshtml.AppendLine(
                      $"<td style='text-align:center;'>{(user.LoggedHours.TotalSeconds == 0 ? '-' : user.LoggedHours):hh\\:mm\\:ss}</td>"
                    );
                    weekdayshtml.AppendLine(
                      $"<td style='text-align:center;'>{(user.WorkingHours.TotalSeconds == 0 ? '-' : user.WorkingHours):hh\\:mm\\:ss}</td>"
                    );
                    weekdayshtml.AppendLine(
                      $"<td style='text-align:center;'>{(user.ProductiveHours.TotalSeconds == 0 ? '-' : user.ProductiveHours):hh\\:mm\\:ss}</td>"
                    );
                    weekdayshtml.AppendLine(
                      $"<td style='text-align:center;'>{(user.UnProductiveHours.TotalSeconds == 0 ? '-' : user.UnProductiveHours):hh\\:mm\\:ss}</td>"
                    );
                    weekdayshtml.AppendLine(
                      $"<td style='text-align:center;'>{(user.IdleHours.TotalSeconds == 0 ? '-' : user.IdleHours):hh\\:mm\\:ss}</td>"
                    );
                    weekdayshtml.AppendLine("</tr>");
                  }
                }

                if (!validDays.Any())
                {
                  _logger.Debug("No valid days found for email: ");
                  // emailBody.AppendLine($"<h4>No Records Found</h4>");
                  continue;
                }
                var averageWorkingHours = TimeSpan.FromSeconds(
                  validDays.Average(user => user.WorkingHours.TotalSeconds)
                );
                var averageProductiveHours = TimeSpan.FromSeconds(
                  validDays.Average(user => user.ProductiveHours.TotalSeconds)
                );
                var averageUnProductiveHours = TimeSpan.FromSeconds(
                  validDays.Average(user => user.UnProductiveHours.TotalSeconds)
                );

                weekdayshtml.AppendLine("</table>");

                weekdayshtml.AppendLine("<br/>");
                averagehourshtml.AppendLine(
                  "<table border='1' style='border-collapse: collapse;'>"
                );
                averagehourshtml.AppendLine(
                  "<tr style='background-color:#5B9BD5;padding:10px;color:#F6F5F5;font-size:16px;font-family:calibri;'>"
                );

                averagehourshtml.AppendLine("<th>Avg.WorkingHours</th>");
                averagehourshtml.AppendLine("<th>Avg. ProductiveHours</th>");
                averagehourshtml.AppendLine("<th>Avg.UnProductiveHours</th>");
                averagehourshtml.AppendLine("</tr>");

                //values
                averagehourshtml.AppendLine(
                  "<tr style='padding:4px;font-size:16px;font-family:calibri;' >"
                );
                averagehourshtml.AppendLine($"<td>{averageWorkingHours:hh\\:mm\\:ss}</td>");
                averagehourshtml.AppendLine($"<td>{averageProductiveHours:hh\\:mm\\:ss}</td>");
                averagehourshtml.AppendLine($"<td>{averageUnProductiveHours:hh\\:mm\\:ss}</td>");

                averagehourshtml.AppendLine("</tr>");
                averagehourshtml.AppendLine("</table>");

                // Add a separate table for weekends
                averagehourshtml.AppendLine("<br/>");
                weekendhtml.AppendLine("<table border='1' style='border-collapse: collapse;'>");
                weekendhtml.AppendLine(
                  "<tr style='background-color:#FF0000;padding:10px;color:#FFFFFF;font-size:16px;font-family:calibri;'>"
                );
                weekendhtml.AppendLine("<th>Weekend Dates</th>");
                weekendhtml.AppendLine("<th>Logged Hours</th>");
                weekendhtml.AppendLine("<th>Working Hours</th>");
                weekendhtml.AppendLine("<th>Productive Hours</th>");
                weekendhtml.AppendLine("<th>Unproductive Hours</th>");
                weekendhtml.AppendLine("<th>Idle Hours</th>");
                weekendhtml.AppendLine("</tr>");

                // Include weekend information in the email body
                foreach (var user in weekendDays)
                {
                  if (user != null)
                  {
                    //values
                    weekendhtml.AppendLine(
                      "<tr style=padding:4px;font-size:16px;font-family:calibri;'>"
                    );
                    weekendhtml.AppendLine($"<td style='text-align:center;'>{user.Dates}</td>");
                    weekendhtml.AppendLine(
                      $"<td style='text-align:center;'>{(user.LoggedHours.TotalSeconds == 0 ? '-' : user.LoggedHours):hh\\:mm\\:ss}</td>"
                    );
                    weekendhtml.AppendLine(
                      $"<td style='text-align:center;'>{(user.WorkingHours.TotalSeconds == 0 ? '-' : user.WorkingHours):hh\\:mm\\:ss}</td>"
                    );
                    weekendhtml.AppendLine(
                      $"<td style='text-align:center;'>{(user.ProductiveHours.TotalSeconds == 0 ? '-' : user.ProductiveHours):hh\\:mm\\:ss}</td>"
                    );
                    weekendhtml.AppendLine(
                      $"<td style='text-align:center;'>{(user.UnProductiveHours.TotalSeconds == 0 ? '-' : user.UnProductiveHours):hh\\:mm\\:ss}</td>"
                    );
                    weekendhtml.AppendLine(
                      $"<td style='text-align:center;'>{(user.IdleHours.TotalSeconds == 0 ? '-' : user.IdleHours):hh\\:mm\\:ss}</td>"
                    );
                    weekendhtml.AppendLine("</tr>");
                  }
                }

                weekendhtml.AppendLine("</table>");

                // Append all email format
                if (averageWorkingHours.TotalHours < AverageHours)
                {
                  emailBody.AppendLine($"<h2> Weekly report of {userName},</h2>");
                  emailBody.AppendLine(weekdayshtml.ToString());
                  emailBody.AppendLine(averagehourshtml.ToString());
                  emailBody.AppendLine(weekendhtml.ToString());
                }
                emailBody.AppendLine("</body></html>");
              }

              _logger.Information("email before send : " + Email);

              //Send email
              await _emailService.SendEmailAsync(
                Email,
                "Weekly Consolidation Report for User Monitor",
                emailBody.ToString()
              );
            }
          }
        }
        catch (Exception ex)
        {
          _logger.Debug("Error in email sending" + ex.Message);
          _logger.Information("Error in email sending" + ex.InnerException);
        }
        finally
        {
          connection.Close();
        }
      }
    }
  }
}
