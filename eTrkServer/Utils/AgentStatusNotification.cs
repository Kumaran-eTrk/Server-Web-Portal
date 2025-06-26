using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace eTrkServer.Utils
{
  public class AgentStatusNotification : BackgroundService
  {
    private readonly IConfiguration _configuration;

    private readonly string targetEmail;
    private readonly EmailService _emailService;
    private readonly IServiceScopeFactory _service;

    private readonly int _morningTime;
    private readonly int _afternoonTime;
    private readonly int _eveningTime;
    private readonly Serilog.ILogger _logger;

    public AgentStatusNotification(
      IServiceScopeFactory service,
      IConfiguration configuration,
      Serilog.ILogger logger
    )
    {
      _service = service;
      _logger = logger;
      _configuration = configuration;
      targetEmail = configuration["SysTeam:TargetEmail"];
      _morningTime = configuration.GetValue<int>("AgentStatusNotification:Morning");
      _afternoonTime = configuration.GetValue<int>("AgentStatusNotification:Afternoon");
      _eveningTime = configuration.GetValue<int>("AgentStatusNotification:Evening");
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
            15,
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

          // Execute the task
          await DoAgentStatusAsync();
        }
        catch (Exception ex)
        {
          _logger.Debug("Error in executing the nonlogged method: " + ex.Message);
        }
      }
    }

    private async Task DoAgentStatusAsync()
    {
      var scope = _service.CreateScope();

      AppDbContext _context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
      EmailService _emailService = scope.ServiceProvider.GetRequiredService<EmailService>();

      Console.WriteLine("Executing AgentStatus Method");

      NpgsqlConnection connection = new NpgsqlConnection(
        _context.Database.GetDbConnection().ConnectionString
      );

      try
      {
        List<string> noticeMessages = new List<string>();

        connection.Notice += (sender, e) =>
        {
          string noticeMessage = e.Notice.MessageText;
          Console.WriteLine(noticeMessage);
          noticeMessages.Add(noticeMessage);
        };

        connection.Open();

        using (NpgsqlCommand command = new NpgsqlCommand("check_user_activity_email", connection))
        {
          command.CommandType = CommandType.StoredProcedure;
          await command.ExecuteNonQueryAsync();
        }

        if (noticeMessages.Count > 0)
        {
          var employeeStatus =
            new Dictionary<
              string,
              List<(string username, string domain, string status, string lastCurrentDateTime)>
            >();

          // Parsing and organizing the data
          foreach (var message in noticeMessages)
          {
            var parts = message.Split(new[] { ", " }, StringSplitOptions.None);
            var displayName = parts[0].Split(new[] { ": " }, StringSplitOptions.None)[1];
            var username = parts[1].Split(new[] { ": " }, StringSplitOptions.None)[1].Trim();
            var domain = parts[2].Split(new[] { ": " }, StringSplitOptions.None)[1].Trim();
            var lastCurrentDateTime = parts[3]
              .Split(new[] { ": " }, StringSplitOptions.None)[1]
              .Trim();
            var status = parts[4].Split(new[] { ": " }, StringSplitOptions.None)[1].Trim();

            if (!employeeStatus.ContainsKey(displayName))
            {
              employeeStatus[displayName] =
                new List<(
                  string username,
                  string domain,
                  string status,
                  string lastCurrentDateTime
                )>();
            }

            employeeStatus[displayName].Add((username, domain, status, lastCurrentDateTime));
          }

          var emailBody = new StringBuilder();
          emailBody.AppendLine("<html><body>");
          emailBody.AppendLine("<h2>Today Agent Status</h2>");

          // Create a table for Running status
          emailBody.AppendLine("<table border='1'>");
          emailBody.AppendLine("<tr>");
          emailBody.AppendLine("<th style='text-align:left;'>Employee Name</th>");
          emailBody.AppendLine("<th style='text-align:left;'>Overall Status</th>");
          emailBody.AppendLine("<th colspan='2' style='text-align:center;'>UserName & Domain</th>");
          emailBody.AppendLine("<th colspan='1' style='text-align:center;'>Status</th>");
          emailBody.AppendLine("<th colspan='1' style='text-align:center;'>Last Working Date</th>");
          emailBody.AppendLine("</tr>");

          var sortedEmployeeStatus = employeeStatus.OrderByDescending(kv =>
            kv.Value.All(v => v.status == "FALSE")
              ? 2
              : // Sort agents with both domains not running first
              kv.Value.Any(v => v.status == "FALSE")
                ? 1
                : 0
          );
          foreach (var kvp in sortedEmployeeStatus)
          {
            emailBody.AppendLine("<tr>");
            emailBody.AppendLine($"<td rowspan='{kvp.Value.Count}'>{kvp.Key}</td>");

            bool overallStatus = kvp.Value.Any(x => x.status == "FALSE");

            emailBody.Append(
              $"<td rowspan='{kvp.Value.Count}' style='color:{(overallStatus ? "red" : "green")}'>{(overallStatus ? "Not Running" : "Running")}</td>"
            );

            bool firstRow = true;
            foreach (var (username, domain, status, lastCurrentDateTime) in kvp.Value)
            {
              if (!firstRow)
              {
                emailBody.AppendLine("<tr>");
              }
              emailBody.AppendLine($"<td>{username}</td>");
              emailBody.AppendLine($"<td>{domain}</td>");
              emailBody.Append(
                $"<td style='text-align:left;color:{(status == "TRUE" ? "green" : "red")}'>{(status == "TRUE" ? "Running" : "Not Running")}</td>"
              );
              emailBody.AppendLine($"<td>{lastCurrentDateTime}</td>");
              emailBody.AppendLine("</tr>");

              firstRow = false;
            }
          }

          emailBody.AppendLine("</table>");
          emailBody.AppendLine("</body></html>");

          // Send email
          await _emailService.SendEmailAsync(
            targetEmail,
            "System Activity Notification",
            emailBody.ToString()
          );
        }
      }
      catch (Exception ex)
      {
        _logger.Debug("Error in email sending" + ex.Message);
        Console.WriteLine("Error in email sending" + ex.InnerException);
      }
      finally
      {
        connection.Close();
      }
    }
  }
}
