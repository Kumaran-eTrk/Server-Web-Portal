using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Npgsql;
using NpgsqlTypes;

namespace eTrkServer.Utils
{
  public class LoggingHoursNotification : BackgroundService
  {
    private readonly IServiceScopeFactory _service;
    private readonly Serilog.ILogger _logger;
    private readonly int _executionHourUtc;
    private readonly int _executionMinuteUtc;
    private readonly int _executionSecondUtc;

    public LoggingHoursNotification(
      IServiceScopeFactory service,
      IConfiguration configuration,
      Serilog.ILogger logger
    )
    {
      _service = service;
      _logger = logger;

      _executionHourUtc = configuration.GetValue<int>("AverageHoursNotification:ExecutionHourUtc");
      _executionMinuteUtc = configuration.GetValue<int>(
        "AverageHoursNotification:ExecutionMinuteUtc"
      );
      _executionSecondUtc = configuration.GetValue<int>(
        "AverageHoursNotification:ExecutionSecondUtc"
      );
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
        _logger.Error("Error in executing the method" + ex.InnerException);
      }
    }

    private async Task LoggingHours()
    {
      var scope = _service.CreateScope();

      AppDbContext _context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
      EmailService _emailService = scope.ServiceProvider.GetRequiredService<EmailService>();

      _logger.Information("Executing Average Hours Method");

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
      var projects = await _context.ProjectMaster.ToListAsync();
      foreach (var project in projects)
      {
        _logger.Information("project id :" + project.Id);
        try
        {
          connection.Open();
          using (
            NpgsqlCommand command = new NpgsqlCommand(
              "calculate_user_average_hours_project",
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
              new NpgsqlParameter("p_project_id", NpgsqlDbType.Text) { Value = project.Id }
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
                  IdleHours = idlehours,
                };
              })
              .GroupBy(user => user.Email);

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

            // Send an email to each reporting-to email once
            foreach (var group in usersGroupedByEmail)
            {
              var Email = group.Key;
              var Name = group.First().DisplayName;
              var Cc = group.First().ReportingTo;
              _logger.Information("email" + " " + Email);
              var validDays = group
                .Where(user =>
                  user.WorkingHours.TotalSeconds > 0
                  && user.LoggedHours.TotalSeconds > 0
                  && DateTime.Parse(user.Dates).DayOfWeek != DayOfWeek.Saturday
                  && DateTime.Parse(user.Dates).DayOfWeek != DayOfWeek.Sunday
                )
                .ToList();
              var weekdays = group
                .Where(user =>
                  DateTime.Parse(user.Dates).DayOfWeek != DayOfWeek.Saturday
                  && DateTime.Parse(user.Dates).DayOfWeek != DayOfWeek.Sunday
                )
                .ToList();
              var weekendDays = group
                .Where(user =>
                  DateTime.Parse(user.Dates).DayOfWeek == DayOfWeek.Saturday
                  || DateTime.Parse(user.Dates).DayOfWeek == DayOfWeek.Sunday
                )
                .ToList();

              var emailBody = new StringBuilder();
              var weekdayshtml = new StringBuilder();
              var averagehourshtml = new StringBuilder();
              var weekendhtml = new StringBuilder();

              emailBody.AppendLine("<html><body>");

              emailBody.AppendLine($"<h2>Dear {Name},</h2>");
              emailBody.AppendLine("<div>");
              emailBody.AppendLine(
                $"<p>This is to inform you that your Weekly Report for User Monitor, effective from {formattedFirstDate}  to  {formattedLastDate}, is as follows:</p>"
              );
              emailBody.AppendLine("</div>");

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
                    $"<td style='text-align:center;'>{(user.IdleHours == "00:00:00" ? '-' : user.IdleHours):hh\\:mm\\:ss}</td>"
                  );
                  weekdayshtml.AppendLine("</tr>");
                }
              }

              if (!validDays.Any())
              {
                _logger.Debug("No valid days found for email: " + Email);
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
              Console.WriteLine($"Average Hours " + averageWorkingHours);

              weekdayshtml.AppendLine("</table>");

              weekdayshtml.AppendLine("<br/>");
              averagehourshtml.AppendLine("<table border='1' style='border-collapse: collapse;'>");
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
                    $"<td style='text-align:center;'>{(user.IdleHours == "00:00:00" ? '-' : user.IdleHours):hh\\:mm\\:ss}</td>"
                  );
                  weekendhtml.AppendLine("</tr>");
                }
              }

              weekendhtml.AppendLine("</table>");

              // Append all email format
              emailBody.AppendLine(weekdayshtml.ToString());
              emailBody.AppendLine(averagehourshtml.ToString());
              emailBody.AppendLine(weekendhtml.ToString());

              emailBody.AppendLine(
                "<p>If you have any questions or require further clarification, feel free to reach your manager.</p>"
              );
              emailBody.AppendLine("</br>");
              emailBody.AppendLine("<div>");
              emailBody.AppendLine("<p>Regards,</p>");
              emailBody.AppendLine("<p>HR Team</p>");
              emailBody.AppendLine("</div>");
              emailBody.AppendLine("</body></html>");
              _logger.Information("email before send : " + Email);
              //Send email
              await _emailService.SendEmailAverage(
                Email,
                Cc,
                "Weekly Report for User Monitor",
                emailBody.ToString()
              );
            }
          }
        }
        catch (Exception ex)
        {
          _logger.Debug("Error in Average Hours Notifications" + ex.Message);
          _logger.Error("Error in Average Hours Notifications" + ex.InnerException);
        }
        finally
        {
          connection.Close();
        }
      }
    }
  }
}
