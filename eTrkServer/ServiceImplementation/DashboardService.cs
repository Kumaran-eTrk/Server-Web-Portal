using System.Data;
using eTrkServer.DTO.RequestDTO;
using eTrkServer.DTO.ResponseDTO;
using eTrkServer.Helpers;
using eTrkServer.Interface;
using eTrkServer.Utils;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using NpgsqlTypes;

namespace eTrkServer.ServiceImplementation
{
  public class DashboardService : IDashboardService
  {
    private readonly AppDbContext _context;
    private readonly Serilog.ILogger _logger;

    public DashboardService(AppDbContext context, Serilog.ILogger logger)
    {
      _context = context;
      _logger = logger;
    }

    public async Task<BaseResponse<IEnumerable<ApplicationUsageResponse>>> GetApplicationUsage(
      ApplicationUsageRequest request,
      string division,
      string project
    )
    {
      BaseResponse<IEnumerable<ApplicationUsageResponse>> response = new();
      NpgsqlConnection connection = new NpgsqlConnection(
        _context.Database.GetDbConnection().ConnectionString
      );
      try
      {
        List<string> noticeMessages = new List<string>();
        List<object> resultData = new List<object>();

        connection.Notice += (sender, e) =>
        {
          string noticeMessage = e.Notice.MessageText;
          noticeMessages.Add(noticeMessage);
        };

        await connection.OpenAsync();
        DateTime BeforeQuery = DateTime.Now;

        _logger.Debug("Before Execution of productivity : " + BeforeQuery);

        using (NpgsqlCommand command = new NpgsqlCommand("calculate_app_productivity", connection))
        {
          command.CommandType = CommandType.StoredProcedure;
          command
            .Parameters.AddWithValue("p_user_activity_from_date", request.fromDate)
            .NpgsqlDbType = NpgsqlDbType.Timestamp;
          command.Parameters.AddWithValue("p_user_activity_to_date", request.toDate).NpgsqlDbType =
            NpgsqlDbType.Timestamp;
          command.Parameters.AddWithValue("p_type", request.type);
          command.Parameters.Add(
            new NpgsqlParameter("p_location", NpgsqlDbType.Text)
            {
              Value = string.IsNullOrWhiteSpace(request.location)
                ? (object)DBNull.Value
                : request.location
            }
          );

          command.Parameters.Add(
            new NpgsqlParameter("p_division", NpgsqlDbType.Text)
            {
              Value = string.IsNullOrWhiteSpace(division) ? (object)DBNull.Value : division
            }
          );

          command.Parameters.Add(
            new NpgsqlParameter("p_project", NpgsqlDbType.Text)
            {
              Value = string.IsNullOrWhiteSpace(project) ? (object)DBNull.Value : project
            }
          );

          command.Parameters.Add(
            new NpgsqlParameter("p_email", NpgsqlDbType.Array | NpgsqlDbType.Text)
            {
              Value =
                (request.email != null && request.email.Any())
                  ? request.email.ToArray()
                  : (object)DBNull.Value
            }
          );

          using (NpgsqlDataReader reader = await command.ExecuteReaderAsync()) // Use async version for executing the reader
          {
            while (await reader.ReadAsync()) // Use async version for reading data
            {
              string application = reader["Application"].ToString();
              double activeMinutes = Convert.ToDouble(reader["ActiveMinutes"]);
              bool productive = Convert.ToBoolean(reader["Productive"]);

              resultData.Add(
                new
                {
                  Application = application,
                  ActiveMinutes = activeMinutes,
                  Productive = productive
                }
              );
            }
          }
          DateTime AfterQuery = DateTime.Now;

          _logger.Debug("After Execution of productivity : " + AfterQuery);
        }

        if (noticeMessages.Count > 0)
        {
          var formattedMessages = noticeMessages.Select(message =>
          {
            var parts = message.Split(new[] { ", " }, StringSplitOptions.None);
            var application = parts[0].Split(new[] { ": " }, StringSplitOptions.None)[1];
            var activeMinutes = TimeConvert.ConvertToHoursFormat(
              parts[1].Split(new[] { ": " }, StringSplitOptions.None)[1]
            );
            var productive = bool.Parse(
              parts[2].Split(new[] { ": " }, StringSplitOptions.None)[1].ToLower()
            );
            return new ApplicationUsageResponse
            {
              Application = application,
              ActiveMinutes = activeMinutes,
              Productive = productive
            };
          });

          if (formattedMessages.Any())
          {
            var filteredResults =
              request.type.ToLower() == "productive"
                ? formattedMessages.Where(result => result.Productive)
                : request.type.ToLower() == "unproductive"
                  ? formattedMessages.Where(result => !result.Productive)
                  : formattedMessages;

            _logger.Debug("getapps executed successfully" + formattedMessages);
            response.Message = "GetApps executed successfully.";
            response.Success = true;
            response.Data = filteredResults;
          }
          else
          {
            response.Message = "No data found.";
            response.Success = false;
          }
        }
        else
        {
          response.Message = "No data found.";
          response.Success = false;
        }

        return response;
      }
      catch (Exception ex)
      {
        _logger.Debug("error in Working Productivity" + ex.Message);
        _logger.Error("Error in Working Productivity" + ex.StackTrace);
        response.Success = false;
        response.Message = ex.Message;
        return response;
      }
      finally
      {
        await connection.CloseAsync(); // Use async version to close the connection
      }
    }

    public async Task<BaseResponse<IEnumerable<IpAddressResponse>>> GetIpAddress(
      IPAddressRequest request,
      string division,
      string project
    )
    {
      BaseResponse<IEnumerable<IpAddressResponse>> response = new();
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

        using (
          NpgsqlCommand command = new NpgsqlCommand(
            "calculate_combined_ipaddress_combined",
            connection
          )
        )
        {
          command.CommandType = CommandType.StoredProcedure;

          command.Parameters.AddWithValue("p_from_date", request.fromDate).NpgsqlDbType =
            NpgsqlDbType.Timestamp;
          command.Parameters.AddWithValue("p_to_date", request.toDate).NpgsqlDbType =
            NpgsqlDbType.Timestamp;

          command.Parameters.Add(
            new NpgsqlParameter("p_location", NpgsqlDbType.Text)
            {
              Value = string.IsNullOrWhiteSpace(request.location)
                ? (object)DBNull.Value
                : request.location
            }
          );

          command.Parameters.Add(
            new NpgsqlParameter("p_division", NpgsqlDbType.Text)
            {
              Value = string.IsNullOrWhiteSpace(division) ? (object)DBNull.Value : division
            }
          );

          command.Parameters.Add(
            new NpgsqlParameter("p_project", NpgsqlDbType.Text)
            {
              Value = string.IsNullOrWhiteSpace(project) ? (object)DBNull.Value : project
            }
          );

          command.Parameters.Add(
            new NpgsqlParameter("p_email", NpgsqlDbType.Array | NpgsqlDbType.Text)
            {
              Value =
                (request.email != null && request.email.Any())
                  ? request.email.ToArray()
                  : (object)DBNull.Value
            }
          );

          await command.ExecuteNonQueryAsync();
        }

        if (noticeMessages.Count > 0)
        {
          var formattedMessages = noticeMessages.Select(message =>
          {
            var parts = message.Split(new[] { ", " }, StringSplitOptions.None);
            var ipAddress = parts[0].Split(new[] { ": " }, StringSplitOptions.None)[1];
            var Username = parts[1].Split(new[] { ": " }, StringSplitOptions.None)[1].Trim('"');
            var DisplayName = parts[2].Split(new[] { ": " }, StringSplitOptions.None)[1].Trim('"');
            var RecordDateTime = parts[3]
              .Split(new[] { ": " }, StringSplitOptions.None)[1]
              .Trim('"');

            return new IpAddressResponse
            {
              ipAddress = ipAddress,
              Username = Username,
              DisplayName = DisplayName,
              RecordDateTime = RecordDateTime
            };
          });

          _logger.Debug("ipaddress executed successfully: " + formattedMessages);
          response.Message = "IpAddress executed successfully.";
          response.Success = true;
          response.Data = formattedMessages;
        }
        else
        {
          response.Message = "No data found.";
          response.Success = false;
        }

        return response;
      }
      catch (Exception ex)
      {
        _logger.Debug("Error in ipaddress: " + ex.Message);
        _logger.Error("Error in ipaddress: " + ex.StackTrace);
        response.Success = false;
        response.Message = ex.Message;
        return response;
      }
      finally
      {
        connection.Close();
      }
    }

    public Task<BaseResponse<IEnumerable<object>>> GetUserApplicationUsage(
      ApplicationUsageRequest request,
      string division,
      string project
    )
    {
      BaseResponse<IEnumerable<object>> response = new();
      NpgsqlConnection connection = new NpgsqlConnection(
        _context.Database.GetDbConnection().ConnectionString
      );
      try
      {
        List<string> noticeMessages = new List<string>();
        List<object> resultData = new List<object>();

        connection.Notice += (sender, e) =>
        {
          string noticeMessage = e.Notice.MessageText;
          Console.WriteLine(noticeMessage);
          noticeMessages.Add(noticeMessage);
        };

        connection.Open();
        DateTime BeforeQuery = DateTime.Now;

        _logger.Debug("Before Execution of productivity : " + BeforeQuery);

        using (
          NpgsqlCommand command = new NpgsqlCommand("calculate_app_productivity_name", connection)
        )
        {
          command.CommandType = CommandType.StoredProcedure;
          command
            .Parameters.AddWithValue("p_user_activity_from_date", request.fromDate)
            .NpgsqlDbType = NpgsqlDbType.Timestamp;
          command.Parameters.AddWithValue("p_user_activity_to_date", request.toDate).NpgsqlDbType =
            NpgsqlDbType.Timestamp;
          command.Parameters.AddWithValue("p_type", request.type);
          command.Parameters.Add(
            new NpgsqlParameter("p_location", NpgsqlDbType.Text)
            {
              Value = string.IsNullOrWhiteSpace(request.location)
                ? (object)DBNull.Value
                : request.location
            }
          );

          command.Parameters.Add(
            new NpgsqlParameter("p_division", NpgsqlDbType.Text)
            {
              Value = string.IsNullOrWhiteSpace(division) ? (object)DBNull.Value : division
            }
          );

          command.Parameters.Add(
            new NpgsqlParameter("p_project", NpgsqlDbType.Text)
            {
              Value = string.IsNullOrWhiteSpace(project) ? (object)DBNull.Value : project
            }
          );

          command.Parameters.Add(
            new NpgsqlParameter("p_email", NpgsqlDbType.Array | NpgsqlDbType.Text)
            {
              Value =
                (request.email != null && request.email.Any())
                  ? request.email.ToArray()
                  : (object)DBNull.Value
            }
          );

          using (NpgsqlDataReader reader = command.ExecuteReader())
          {
            while (reader.Read())
            {
              string DisplayName = reader["DisplayName"].ToString();
              string application = reader["Application"].ToString();
              double activeMinutes = Convert.ToDouble(reader["ActiveMinutes"]);
              bool productive = Convert.ToBoolean(reader["Productive"]);

              resultData.Add(
                new
                {
                  DisplayName = DisplayName,
                  Application = application,
                  ActiveMinutes = activeMinutes,
                  Productive = productive
                }
              );
            }
          }
          DateTime AfterQuery = DateTime.Now;

          _logger.Debug("After Execution of productivity : " + AfterQuery);
        }

        if (noticeMessages.Count > 0)
        {
          var formattedMessages = noticeMessages.Select(message =>
          {
            var parts = message.Split(new[] { ", " }, StringSplitOptions.None);
            var displayName = parts[0].Split(new[] { ": " }, StringSplitOptions.None)[1];
            var application = parts[1].Split(new[] { ": " }, StringSplitOptions.None)[1];
            var activeMinutes = TimeConvert.ConvertToHoursFormat(
              parts[2].Split(new[] { ": " }, StringSplitOptions.None)[1]
            );
            var productive = bool.Parse(
              parts[3].Split(new[] { ": " }, StringSplitOptions.None)[1].ToLower()
            );
            return new
            {
              DisplayName = displayName,
              Application = application,
              ActiveMinutes = activeMinutes,
              Productive = productive
            };
          });

          if (formattedMessages.Any())
          {
            var filteredResults =
              request.type.ToLower() == "productive"
                ? formattedMessages.Where(result => result.Productive)
                : request.type.ToLower() == "unproductive"
                  ? formattedMessages.Where(result => !result.Productive)
                  : formattedMessages;
            _logger.Debug("admin getapps executed successfully" + formattedMessages);

            var groupedResult = filteredResults
              .GroupBy(r => ((dynamic)r).DisplayName)
              .Select(g => new
              {
                DisplayName = g.Key,
                Applications = g.Select(a => new
                  {
                    Application = ((dynamic)a).Application,
                    ActiveMinutes = ((dynamic)a).ActiveMinutes,
                    Productive = ((dynamic)a).Productive
                  })
                  .ToList()
              });

            response.Message = "GetApps executed successfully.";
            response.Success = true;
            response.Data = filteredResults;
          }
          else
          {
            response.Message = "No data found.";
            response.Success = false; // Return an empty list
          }
        }
        else
        {
          response.Message = "No data found.";
          response.Success = false;
        }
        return Task.FromResult(response);
      }
      catch (Exception ex)
      {
        _logger.Debug("error in Working Productivity" + ex.Message);
        _logger.Error("Error in Working Productivity" + ex.StackTrace);
        response.Success = false;
        response.Message = ex.Message;
        return Task.FromResult(response);
      }
      finally
      {
        connection.Close();
      }
    }

    public async Task<(
      IEnumerable<WorkSummary> dateWiseMetrics,
      TotalHoursSummary totalHours
    )> GetWorkSummary(WorkSummaryRequest request, string division, string project)
    {
      {
        List<WorkSummary> dateWiseMetrics = new List<WorkSummary>();
        TotalHoursSummary totalHours = null;

        NpgsqlConnection connection = new NpgsqlConnection(
          _context.Database.GetDbConnection().ConnectionString
        );

        try
        {
          List<string> noticeMessages = new List<string>();
          connection.Notice += (sender, e) => noticeMessages.Add(e.Notice.MessageText);
          connection.Open();

          using (NpgsqlCommand command = new NpgsqlCommand("calculate_work_summary", connection))
          {
            command.CommandType = CommandType.StoredProcedure;
            command
              .Parameters.AddWithValue("p_user_activity_from_date", request.fromDate)
              .NpgsqlDbType = NpgsqlDbType.Timestamp;
            command
              .Parameters.AddWithValue("p_user_activity_to_date", request.toDate)
              .NpgsqlDbType = NpgsqlDbType.Timestamp;
            command
              .Parameters.AddWithValue(
                "p_location",
                string.IsNullOrWhiteSpace(request.location)
                  ? (object)DBNull.Value
                  : request.location
              )
              .NpgsqlDbType = NpgsqlDbType.Text;
            command
              .Parameters.AddWithValue(
                "p_division",
                string.IsNullOrWhiteSpace(division) ? (object)DBNull.Value : division
              )
              .NpgsqlDbType = NpgsqlDbType.Text;
            command
              .Parameters.AddWithValue(
                "p_project",
                string.IsNullOrWhiteSpace(project) ? (object)DBNull.Value : project
              )
              .NpgsqlDbType = NpgsqlDbType.Text;
            command
              .Parameters.AddWithValue(
                "p_email",
                request.email != null && request.email.Any()
                  ? (object)request.email.ToArray()
                  : (object)DBNull.Value
              )
              .NpgsqlDbType = NpgsqlDbType.Array | NpgsqlDbType.Text;

            await command.ExecuteNonQueryAsync();
          }

          // Process notice messages
          foreach (var message in noticeMessages)
          {
            if (message.StartsWith("User:"))
            {
              var parts = message.Split(new[] { ", " }, StringSplitOptions.None);
              var userMetrics = new WorkSummary
              {
                User = parts[0].Split(new[] { ": " }, StringSplitOptions.None)[1],
                JobTitle = parts[1].Split(new[] { ": " }, StringSplitOptions.None)[1],
                Date = parts[2].Split(new[] { ": " }, StringSplitOptions.None)[1],
                LoggedHours = TimeConvert.ConvertToHoursFormat(
                  parts[3].Split(new[] { ": " }, StringSplitOptions.None)[1]
                ),
                IdleHours = TimeConvert.ConvertToHoursFormat(
                  parts[4].Split(new[] { ": " }, StringSplitOptions.None)[1]
                ),
                WorkingHours = TimeConvert.ConvertToHoursFormat(
                  parts[5].Split(new[] { ": " }, StringSplitOptions.None)[1]
                ),
                ProductiveMinutes = TimeConvert.ConvertToHoursFormat(
                  parts[6].Split(new[] { ": " }, StringSplitOptions.None)[1]
                ),
                NonProductiveMinutes = TimeConvert.ConvertToHoursFormat(
                  parts[7].Split(new[] { ": " }, StringSplitOptions.None)[1]
                ),
              };

              dateWiseMetrics.Add(userMetrics);
            }
            else if (message.StartsWith("Total Productive Hours:"))
            {
              var parts = message.Split(new[] { ", " }, StringSplitOptions.None);
              totalHours = new TotalHoursSummary
              {
                ProductiveHours = TimeConvert.ConvertToHoursFormat(
                  parts[0].Split(new[] { ": " }, StringSplitOptions.None)[1]
                ),
                NonProductiveHours = TimeConvert.ConvertToHoursFormat(
                  parts[1].Split(new[] { ": " }, StringSplitOptions.None)[1]
                ),
                LoggedHours = TimeConvert.ConvertToHoursFormat(
                  parts[2].Split(new[] { ": " }, StringSplitOptions.None)[1]
                ),
                WorkingHours = TimeConvert.ConvertToHoursFormat(
                  parts[3].Split(new[] { ": " }, StringSplitOptions.None)[1]
                ),
                IdleHours = TimeConvert.ConvertToHoursFormat(
                  parts[4].Split(new[] { ": " }, StringSplitOptions.None)[1]
                ),
              };
            }
          }

          return (dateWiseMetrics, totalHours);
        }
        catch (Exception ex)
        {
          _logger.Debug("error in admin WorksummaryGraph" + ex.Message);
          _logger.Error("Error in Working Summary Graph" + ex.StackTrace);
          return (new List<WorkSummary>(), new TotalHoursSummary());
        }
        finally
        {
          // Close the connection if it's open
          if (connection.State == ConnectionState.Open)
          {
            connection.Close();
          }
        }
      }
    }

    public async Task<BaseResponse<IEnumerable<object>>> GetWorkSummaryGraph(
      WorkSummaryRequest request,
      string division,
      string project
    )
    {
      BaseResponse<IEnumerable<object>> response = new();
      NpgsqlConnection connection = new NpgsqlConnection(
        _context.Database.GetDbConnection().ConnectionString
      );
      try
      {
        List<string> noticeMessages = new List<string>();

        DateTime beforeQuery = DateTime.Now;

        _logger.Debug("Before Execution of Graph Summary : " + beforeQuery);

        connection.Notice += (sender, e) =>
        {
          string noticeMessage = e.Notice.MessageText;
          Console.WriteLine(noticeMessage);
          noticeMessages.Add(noticeMessage);
        };

        connection.Open();

        using (
          NpgsqlCommand command = new NpgsqlCommand("calculate_work_summary_graphs", connection)
        )
        {
          command.CommandType = CommandType.StoredProcedure;

          command
            .Parameters.AddWithValue("p_user_activity_from_date", request.fromDate)
            .NpgsqlDbType = NpgsqlDbType.Timestamp;
          command.Parameters.AddWithValue("p_user_activity_to_date", request.toDate).NpgsqlDbType =
            NpgsqlDbType.Timestamp;

          command.Parameters.Add(
            new NpgsqlParameter("p_location", NpgsqlDbType.Text)
            {
              Value = string.IsNullOrWhiteSpace(request.location)
                ? (object)DBNull.Value
                : request.location
            }
          );

          command.Parameters.Add(
            new NpgsqlParameter("p_division", NpgsqlDbType.Text)
            {
              Value = string.IsNullOrWhiteSpace(division) ? (object)DBNull.Value : division
            }
          );

          command.Parameters.Add(
            new NpgsqlParameter("p_project", NpgsqlDbType.Text)
            {
              Value = string.IsNullOrWhiteSpace(project) ? (object)DBNull.Value : project
            }
          );

          command.Parameters.Add(
            new NpgsqlParameter("p_email", request.email?.ToArray() ?? (object)DBNull.Value)
          );

          await command.ExecuteNonQueryAsync();
        }

        DateTime AfterQuery = DateTime.Now;
        _logger.Debug("After Execution of Graph Summary : " + AfterQuery);

        if (noticeMessages.Count > 0)
        {
          var formattedMessages = noticeMessages.Select(message =>
          {
            var parts = message.Split(new[] { ", " }, StringSplitOptions.None);
            var date = parts[0].Split(new[] { ": " }, StringSplitOptions.None)[1];

            var loggedMinutes = TimeConvert.ConvertToHoursFormat(
              parts[1].Split(new[] { ": " }, StringSplitOptions.None)[1].Trim('"')
            );
            var idleMinutes = TimeConvert.ConvertToHoursFormat(
              parts[2].Split(new[] { ": " }, StringSplitOptions.None)[1].Trim('"')
            );
            var workingMinutes = TimeConvert.ConvertToHoursFormat(
              parts[3].Split(new[] { ": " }, StringSplitOptions.None)[1].Trim('"')
            );
            var productiveMinutes = TimeConvert.ConvertToHoursFormat(
              parts[4].Split(new[] { ": " }, StringSplitOptions.None)[1].Trim('"')
            );
            var nonProductiveMinutes = TimeConvert.ConvertToHoursFormat(
              parts[5].Split(new[] { ": " }, StringSplitOptions.None)[1].Trim('"')
            );

            return new WorkSummaryGraphDTO
            {
              Date = date,
              LoggedHours = loggedMinutes,
              IdleHours = idleMinutes,
              WorkingHours = workingMinutes,
              ProductiveHours = productiveMinutes,
              NonProductiveHours = nonProductiveMinutes
            };
          });
          _logger.Debug("Graph Summary executed successfully" + formattedMessages);
          response.Message = "Graph Summary executed successfully.";
          response.Success = true;
          response.Data = formattedMessages;
        }
        else
        {
          response.Message = "No data found.";
          response.Success = false;
        }
        return response;
      }
      catch (Exception ex)
      {
        _logger.Debug("error in  WorksummaryGraph" + ex.Message);
        _logger.Error("Error in Working Summary Graph" + ex.StackTrace);
        response.Success = false;
        response.Message = ex.Message;
        return response;
      }
      finally
      {
        connection.Close();
      }
    }
  }
}
