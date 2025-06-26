using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using NpgsqlTypes;

namespace eTrkServer.Utils
{
  public class NonLoggedNotification : BackgroundService
  {
    private readonly IServiceScopeFactory _service;
    private readonly Serilog.ILogger _logger;

    private readonly int _morningTime;
    private readonly int _afternoonTime;
    private readonly int _eveningTime;

    public NonLoggedNotification(
      IServiceScopeFactory service,
      IConfiguration configuration,
      Serilog.ILogger logger
    )
    {
      _service = service;
      _logger = logger;

      _morningTime = configuration.GetValue<int>("NonLoggedNotification:Morning");
      _afternoonTime = configuration.GetValue<int>("NonLoggedNotification:Afternoon");
      _eveningTime = configuration.GetValue<int>("NonLoggedNotification:Evening");
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
      while (!stoppingToken.IsCancellationRequested)
      {
        try
        {
          var currentTime = DateTime.UtcNow;

          // Define the specific times for email triggers
          var morningTime = new DateTime(
            currentTime.Year,
            currentTime.Month,
            currentTime.Day,
            _morningTime,
            30,
            0
          ); // 6:00 AM
          var afternoonTime = new DateTime(
            currentTime.Year,
            currentTime.Month,
            currentTime.Day,
            _afternoonTime,
            30,
            0
          ); // 12:00 PM
          var eveningTime = new DateTime(
            currentTime.Year,
            currentTime.Month,
            currentTime.Day,
            _eveningTime,
            30,
            0
          ); // 6:00 PM

          // Find the next execution time
          var executionTimes = new[] { morningTime, afternoonTime, eveningTime }
            .Where(time => time > currentTime)
            .OrderBy(time => time)
            .ToList();

          // If all times are in the past, schedule for the next day
          if (!executionTimes.Any())
          {
            executionTimes.Add(morningTime.AddDays(1));
            executionTimes.Add(afternoonTime.AddDays(1));
            executionTimes.Add(eveningTime.AddDays(1));
          }

          var nextExecutionTime = executionTimes.First();
          var delay = nextExecutionTime - currentTime;

          // Wait until the next execution time
          await Task.Delay(delay, stoppingToken);

          var startRange = new DateTime(
            currentTime.Year,
            currentTime.Month,
            currentTime.Day,
            8,
            0,
            0
          );
          var endRange = new DateTime(
            currentTime.Year,
            currentTime.Month,
            currentTime.Day,
            11,
            0,
            0
          );

          if (
            nextExecutionTime.Hour == morningTime.Hour
            && nextExecutionTime.Minute == morningTime.Minute
          )
          {
            startRange = new DateTime(
              currentTime.Year,
              currentTime.Month,
              currentTime.Day,
              8,
              0,
              0
            );
            endRange = new DateTime(currentTime.Year, currentTime.Month, currentTime.Day, 11, 0, 0);
          }
          else if (
            nextExecutionTime.Hour == afternoonTime.Hour
            && nextExecutionTime.Minute == afternoonTime.Minute
          )
          {
            startRange = new DateTime(
              currentTime.Year,
              currentTime.Month,
              currentTime.Day,
              12,
              0,
              0
            );
            endRange = new DateTime(currentTime.Year, currentTime.Month, currentTime.Day, 15, 0, 0);
          }
          else if (
            nextExecutionTime.Hour == eveningTime.Hour
            && nextExecutionTime.Minute == eveningTime.Minute
          )
          {
            startRange = new DateTime(
              currentTime.Year,
              currentTime.Month,
              currentTime.Day,
              16,
              0,
              0
            );
            endRange = new DateTime(currentTime.Year, currentTime.Month, currentTime.Day, 20, 0, 0);
          }

          // Execute the task
          await DoNonLoggedAsync(startRange, endRange);
        }
        catch (Exception ex)
        {
          _logger.Debug("Error in executing the nonlogged method: " + ex.Message);
        }
      }
    }

    private async Task DoNonLoggedAsync(DateTime startRange, DateTime endRange)
    {
      var scope = _service.CreateScope();

      AppDbContext _context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
      EmailService _emailService = scope.ServiceProvider.GetRequiredService<EmailService>();

      _logger.Information("Executing nonLogged Method");
      _logger.Information("currenttime : " + DateTime.UtcNow);

      NpgsqlConnection connection = new NpgsqlConnection(
        _context.Database.GetDbConnection().ConnectionString
      );

      try
      {
        List<string> noticeMessages = new List<string>();
        var currentDate = DateTime.Now.Date;
        var fromDate = new DateTime(currentDate.Year, currentDate.Month, currentDate.Day, 0, 0, 0);
        var toDate = new DateTime(currentDate.Year, currentDate.Month, currentDate.Day, 23, 59, 59);

        connection.Notice += (sender, e) =>
        {
          string noticeMessage = e.Notice.MessageText;
          Console.WriteLine(noticeMessage);
          noticeMessages.Add(noticeMessage);
        };

        connection.Open();
        using (NpgsqlCommand command = new NpgsqlCommand("check_user_logged", connection))
        {
          command.CommandType = CommandType.StoredProcedure;

          command.CommandTimeout = 2000;

          // Set parameters with explicit PostgreSQL data types
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
            new NpgsqlParameter("p_startrange", NpgsqlDbType.Timestamp)
            {
              Value = startRange,
              DataTypeName = "timestamp without time zone"
            }
          );
          command.Parameters.Add(
            new NpgsqlParameter("p_endrange", NpgsqlDbType.Timestamp)
            {
              Value = endRange,
              DataTypeName = "timestamp without time zone"
            }
          );
          // Execute the stored procedure
          // await command.ExecuteNonQueryAsync();
          await command.ExecuteNonQueryAsync();

          var usersGroupedByReportingTo = noticeMessages
            .Select(message =>
            {
              var parts = message.Split(new[] { ", " }, StringSplitOptions.None);
              var displayName = parts[0].Split(new[] { ": " }, StringSplitOptions.None)[1];
              var username = parts[1].Split(new[] { ": " }, StringSplitOptions.None)[1].Trim();
              var domain = parts[2].Split(new[] { ": " }, StringSplitOptions.None)[1].Trim();
              var jobTitle = parts[3].Split(new[] { ": " }, StringSplitOptions.None)[1].Trim();
              var lastdate = parts[4].Split(new[] { ": " }, StringSplitOptions.None)[1].Trim();
              var reportingTo = parts[5].Split(new[] { ": " }, StringSplitOptions.None)[1].Trim();
              var shifttime = parts[6].Split(new[] { ": " }, StringSplitOptions.None)[1].Trim();

              return new
              {
                DisplayName = displayName,
                Username = username,
                Domain = domain,
                JobTitle = jobTitle,
                LastDate = lastdate,
                ReportingTo = reportingTo,
                ShiftTime = shifttime
              };
            })
            .GroupBy(user => user.ReportingTo);

          // Send an email to each reporting-to email once
          foreach (var group in usersGroupedByReportingTo)
          {
            var reportingToEmail = group.Key;
            Console.WriteLine("reporting email" + " " + reportingToEmail);
            var emailBody = new StringBuilder();
            emailBody.AppendLine("<html><body>");
            emailBody.AppendLine("<h2>Non Logged Users</h2>");
            emailBody.AppendLine("<table border='1'>");
            emailBody.AppendLine("<tr>");
            emailBody.AppendLine("<th>Employee Name</th>");
            emailBody.AppendLine("<th>Username</th>");
            emailBody.AppendLine("<th>Domain/Work Group</th>");
            emailBody.AppendLine("<th>Job Title</th>");
            emailBody.AppendLine("<th>Shift Time</th>");
            emailBody.AppendLine("<th>Last Date</th>");
            emailBody.AppendLine("</tr>");

            // Include user information in the email body
            foreach (var user in group)
            {
              emailBody.AppendLine("<tr>");
              emailBody.AppendLine($"<td>{user.DisplayName}</td>");
              emailBody.AppendLine($"<td>{user.Username}</td>");
              emailBody.AppendLine($"<td>{user.Domain}</td>");
              emailBody.AppendLine($"<td>{user.JobTitle}</td>");
              emailBody.AppendLine($"<td>{user.ShiftTime}</td>");
              emailBody.AppendLine($"<td>{user.LastDate}</td>");
              emailBody.AppendLine("</tr>");
            }

            emailBody.AppendLine("</table>");
            emailBody.AppendLine("</body></html>");
            // Send email
            _logger.Information("UnLogged Users mail sent successfully");
            await _emailService.SendEmailAsync(
              reportingToEmail,
              "Non Logged Notification",
              emailBody.ToString()
            );
          }
        }
      }
      catch (Exception ex)
      {
        _logger.Debug("Error in email sending" + ex.Message);
      }
      finally
      {
        connection.Close();
      }
    }
  }
}
