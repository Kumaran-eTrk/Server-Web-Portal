using System.Data;
using System.Text;
using eTrkServer.DTO.RequestDTO;
using eTrkServer.DTO.ResponseDTO;
using eTrkServer.Helpers;
using eTrkServer.Interface;
using eTrkServer.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Npgsql;
using NpgsqlTypes;

namespace eTrkServer.ServiceImplementation
{
  public class AdminService : IAdminService
  {
    private readonly AppDbContext _context;
    private readonly Serilog.ILogger _logger;
    private readonly IConfiguration _configuration;

    public AdminService(AppDbContext context, Serilog.ILogger logger, IConfiguration configuration)
    {
      _context = context;
      _logger = logger;
      _configuration = configuration;
    }

    public async Task<BaseResponse<IEnumerable<AgentStatus>>> GetAgentStatus()
    {
      BaseResponse<IEnumerable<AgentStatus>> response = new();
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

        using (NpgsqlCommand cmd = new NpgsqlCommand("check_useragent_activity", connection))
        {
          cmd.CommandType = CommandType.StoredProcedure;

          await cmd.ExecuteNonQueryAsync();
        }

        if (noticeMessages.Count > 0)
        {
          var employeeStatus = new List<AgentStatus>();

          // Parsing and organizing the data
          foreach (var message in noticeMessages)
          {
            var parts = message.Split(new[] { ", " }, StringSplitOptions.None);
            var displayName = parts[0].Split(new[] { ": " }, StringSplitOptions.None)[1];
            var project = parts[1].Split(new[] { ": " }, StringSplitOptions.None)[1];

            var domain = parts[3].Split(new[] { ": " }, StringSplitOptions.None)[1].Trim();
            var lastCurrentDateTime = parts[4]
              .Split(new[] { ": " }, StringSplitOptions.None)[1]
              .Trim();
            var status = parts[5].Split(new[] { ": " }, StringSplitOptions.None)[1].Trim();

            var employee = employeeStatus.FirstOrDefault(e => e.DisplayName == displayName);
            if (employee == null)
            {
              employee = new AgentStatus
              {
                DisplayName = displayName,
                Project = project,
                OverallStatus = status == "TRUE" ? "Running" : "Not Running",
                Domains = new List<DomainStatus>()
              };
              employeeStatus.Add(employee);
            }

            employee.Domains.Add(
              new DomainStatus
              {
                Domain = domain,
                Status = status == "TRUE" ? "Running" : "Not Running",
                LastCurrentDateTime = lastCurrentDateTime
              }
            );
          }

          _logger.Debug("user agent status executed successfully" + employeeStatus);
          response.Success = true;
          response.Data = employeeStatus;
        }
        else
        {
          response.Success = false;
          response.Message = "No Data found";
        }
        return response;
      }
      catch (Exception ex)
      {
        _logger.Debug("Error in user agent status" + ex.Message);
        response.Message = ex.Message.ToString();
        response.Success = false;
        return response;
      }
      finally
      {
        connection.Close();
      }
    }

    public Task<BaseResponse<List<UserDetails>>> GetALlUsers(string email, string userrole)
    {
      BaseResponse<List<UserDetails>> response = new();
      try
      {
        List<UserDetails> users = new List<UserDetails>(); // Corrected type

        var user = _context.UserDatas.FirstOrDefault(u => u.Email == email);

        if (userrole.Contains("Admin"))
        {
          // Admin has access to all users
          users = _context
            .UserDatas.Where(u => !u.isDelete)
            .Select(u => new UserDetails
            {
              UserId = u.Id,
              Email = u.Email,
              UserName = u.LocalADUserName,
              DomainName = u.LocalADDomain,
              JobTitle = u.JobTitle,
              DisplayName = u.DisplayName
            })
            .GroupBy(u => u.Email) // Group by email to filter duplicates
            .Select(g => g.First())
            .ToList();
        }
        else if (userrole.Contains("Manager"))
        {
          if (!userrole.Contains("Admin"))
          {
            List<string> subordinatesEmails = new List<string> { user.Email };

            while (subordinatesEmails.Any())
            {
              var subordinatesUnderCurrentLevel = _context
                .UserDatas.Where(u => subordinatesEmails.Contains(u.ReportingIntoMail))
                .ToList();

              subordinatesEmails = subordinatesUnderCurrentLevel.Select(u => u.Email).ToList();

              users.AddRange(
                subordinatesUnderCurrentLevel
                  .Where(u => u.isDelete == false)
                  .Select(u => new UserDetails
                  {
                    UserId = u.Id,
                    Email = u.Email,
                    UserName = u.LocalADUserName,
                    DomainName = u.LocalADDomain,
                    JobTitle = u.JobTitle,
                    DisplayName = u.DisplayName
                  })
              );
            }

            users = users.GroupBy(u => u.Email).Select(g => g.First()).ToList();
          }
        }

        response.Message = "GetUsers Executed Successfully";
        response.Success = true;

        // Wrap the users list in an object
        response.Data = users; // Creating an anonymous object to wrap users
        _logger.Debug("GetUsers Executed successfully");

        return Task.FromResult(response);
      }
      catch (Exception ex)
      {
        _logger.Debug(ex.Message + " Error in GetUsers");
        response.Message = ex.Message.ToString();
        response.Success = false;
        return Task.FromResult(response);
      }
    }

    public async Task<BaseResponse<IEnumerable<AverageHoursDTO>>> GetAverageHours(
      AverageHours request
    )
    {
      BaseResponse<IEnumerable<AverageHoursDTO>> response = new();
      NpgsqlConnection connection = new NpgsqlConnection(
        _context.Database.GetDbConnection().ConnectionString
      );
      try
      {
        List<string> noticeMessages = new List<string>();

        connection.Notice += (sender, e) =>
        {
          string noticeMessage = e.Notice.MessageText;
          noticeMessages.Add(noticeMessage);
        };

        connection.Open();

        DateTime beforeQuery = DateTime.Now;

        _logger.Debug("Before Execution of AverageHours : " + beforeQuery);

        using (NpgsqlCommand command = new NpgsqlCommand("calculate_average_hours", connection))
        {
          command.CommandType = CommandType.StoredProcedure;

          command.Parameters.Add(
            new NpgsqlParameter("p_email", NpgsqlDbType.Array | NpgsqlDbType.Text)
            {
              Value =
                (request.email != null && request.email.Any())
                  ? request.email.ToArray()
                  : (object)DBNull.Value
            }
          );
          command
            .Parameters.AddWithValue("p_user_activity_from_date", request.fromDate)
            .NpgsqlDbType = NpgsqlDbType.Timestamp;
          command.Parameters.AddWithValue("p_user_activity_to_date", request.toDate).NpgsqlDbType =
            NpgsqlDbType.Timestamp;

          await command.ExecuteNonQueryAsync();
          DateTime AfterQuery = DateTime.Now;
          _logger.Debug("After Execution of AvergaeHours : " + AfterQuery);
        }

        if (noticeMessages.Count > 0)
        {
          var formattedMessages = noticeMessages.Select(message =>
          {
            var parts = message.Split(new[] { ", " }, StringSplitOptions.None);
            var user = parts[0].Split(new[] { ": " }, StringSplitOptions.None)[1];
            var jobTitle = parts[1].Split(new[] { ": " }, StringSplitOptions.None)[1];
            var Team = parts[2].Split(new[] { ": " }, StringSplitOptions.None)[1];
            var workingHours = parts[3].Split(new[] { ": " }, StringSplitOptions.None)[1];

            return new AverageHoursDTO
            {
              User = user,
              JobTitle = jobTitle,
              Team = Team,
              AverageHours = workingHours,
            };
          });
          _logger.Debug("average working hours executed successfully" + formattedMessages);
          response.Message = "average working hours executed successfully";
          response.Success = true;
          response.Data = formattedMessages;
          return response;
        }
        else
        {
          response.Message = "Stored procedure calculate_combined_average has been failed.";
          response.Success = false;
          return response;
        }
      }
      catch (Exception ex)
      {
        _logger.Debug("Error in average working hours" + ex.Message);

        _logger.Error("Error in Average Working Hours" + ex.StackTrace);
        response.Message = ex.Message.ToString();
        response.Success = false;
        return response;
      }
      finally
      {
        connection.Close();
      }
    }

    public Task<BaseResponse<FilterResponse>> GetFilterData(
      FilterDataRequest request,
      string email,
      string userrole
    )
    {
      BaseResponse<FilterResponse> response = new();
      try
      {
        var user = _context.UserDatas.FirstOrDefault(u => u.Email == email);

        if (user == null)
        {
          response.Message = "User not found";
          response.Success = false;
          return Task.FromResult(response); // Wrap response in Task
        }

        List<string> locations = new List<string>();
        List<string> divisions = new List<string>();
        List<string> projects = new List<string>();
        List<UserDetails> users = new List<UserDetails>();

        if (userrole.Contains("Admin"))
        {
          locations = _context
            .UserDatas.Where(u => u.isDelete == false)
            .Select(u => u.Location)
            .Distinct()
            .ToList();

          if (!string.IsNullOrEmpty(request.Location))
          {
            divisions = _context
              .UserDatas.Where(u => u.Location == request.Location)
              .Select(u => u.Division)
              .Distinct()
              .ToList();

            projects = _context
              .UserDatas.Where(u => u.Location == request.Location)
              .Select(u => u.Project.ProjectName)
              .Distinct()
              .ToList();

            if (!string.IsNullOrEmpty(request.Division))
            {
              projects = _context
                .UserDatas.Where(u =>
                  u.Location == request.Location && u.Division == request.Division
                )
                .Select(u => u.Project.ProjectName)
                .Distinct()
                .ToList();
            }

            if (!string.IsNullOrEmpty(request.Project))
            {
              users = _context
                .UserDatas.Where(u =>
                  u.Location == request.Location
                  && u.Division == request.Division
                  && u.Project.ProjectName == request.Project
                  && !u.isDelete
                )
                .Select(u => new UserDetails
                {
                  UserId = u.Id,
                  Email = u.Email,
                  UserName = u.LocalADUserName,
                  DomainName = u.LocalADDomain,
                  JobTitle = u.JobTitle,
                  DisplayName = u.DisplayName
                })
                .GroupBy(u => u.Email)
                .Select(g => g.First())
                .ToList();
            }
          }

          var adminResult = new FilterResponse
          {
            Locations = locations.Distinct().ToList(),
            Divisions = divisions.Distinct().ToList(),
            Projects = projects.Distinct().ToList(),
            Users = users
          };
          _logger.Debug("Admin filtered data executed successfully" + adminResult);
          response.Message = "Admin filtered data executed successfully";
          response.Success = true;
          response.Data = adminResult;
          return Task.FromResult(response); // Wrap response in Task
        }
        else if (userrole.Contains("Manager"))
        {
          List<UserDetails> usersList = new List<UserDetails>();
          List<string> userManagedLocations = new List<string>();
          List<string> userManagedDivisions = new List<string>();
          List<string> userManagedProjects = new List<string>();

          var initialSubordinatesEmails = new List<string> { user.Email };

          while (initialSubordinatesEmails.Any())
          {
            var subordinatesUnderCurrentLevel = _context
              .UserDatas.Where(u => initialSubordinatesEmails.Contains(u.ReportingIntoMail))
              .ToList();

            initialSubordinatesEmails = subordinatesUnderCurrentLevel.Select(u => u.Email).ToList();

            userManagedLocations.AddRange(
              subordinatesUnderCurrentLevel.Select(u => u.Location).Distinct()
            );
          }

          // Filter divisions and projects based on the request
          if (!string.IsNullOrEmpty(request.Location))
          {
            var subordinatesEmails = new List<string> { user.Email };

            while (subordinatesEmails.Any())
            {
              var subordinatesUnderCurrentLevel = _context
                .UserDatas.Where(u => subordinatesEmails.Contains(u.ReportingIntoMail))
                .ToList();

              subordinatesEmails = subordinatesUnderCurrentLevel.Select(u => u.Email).ToList();

              userManagedDivisions.AddRange(
                subordinatesUnderCurrentLevel
                  .Where(u => u.Location == request.Location)
                  .Select(u => u.Division)
                  .Distinct()
              );
            }
          }

          // Filter users based on divison
          if (!string.IsNullOrEmpty(request.Division))
          {
            var subordinatesEmails = new List<string> { user.Email }; // Initialize with the user's email

            while (subordinatesEmails.Any())
            {
              var subordinatesUnderCurrentLevel = _context
                .UserDatas.Include(u => u.Project)
                .Where(u => subordinatesEmails.Contains(u.ReportingIntoMail))
                .ToList();

              // Update the subordinatesEmails list with the emails of subordinates under the current level
              subordinatesEmails = subordinatesUnderCurrentLevel.Select(u => u.Email).ToList();

              userManagedProjects.AddRange(
                subordinatesUnderCurrentLevel
                  .Where(u => u.Division == request.Division && u.Project != null)
                  .Select(u => u.Project.ProjectName)
                  .Distinct()
              );
            }
          }

          // Filter users based on projects
          if (!string.IsNullOrEmpty(request.Project))
          {
            var subordinatesEmails = new List<string> { user.Email };

            while (subordinatesEmails.Any())
            {
              var subordinatesUnderCurrentLevel = _context
                .UserDatas.Include(u => u.Project)
                .Where(u => subordinatesEmails.Contains(u.ReportingIntoMail))
                .ToList();

              subordinatesEmails = subordinatesUnderCurrentLevel.Select(u => u.Email).ToList();

              usersList.AddRange(
                subordinatesUnderCurrentLevel
                  .Where(u =>
                    u.Project != null
                    && u.Project.ProjectName == request.Project
                    && u.Division == request.Division
                    && !u.isDelete
                  )
                  .Select(u => new UserDetails
                  {
                    UserId = u.Id,
                    Email = u.Email,
                    UserName = u.LocalADUserName,
                    DomainName = u.LocalADDomain,
                    JobTitle = u.JobTitle,
                    DisplayName = u.DisplayName
                  })
                  .GroupBy(u => u.Email)
                  .Select(g => g.First())
              );
            }
          }

          var managerResult = new FilterResponse
          {
            Locations = userManagedLocations.Distinct().ToList(),
            Divisions = userManagedDivisions.Distinct().ToList(),
            Projects = userManagedProjects.Distinct().ToList(),
            Users = usersList // This should be List<UserDetails>
          };

          _logger.Debug("Manager filtered data executed successfully");
          response.Message = "Manager filtered data executed successfully";
          response.Success = true;
          response.Data = managerResult;
          return Task.FromResult(response); // Wrap response in Task
        }

        return Task.FromResult(response); // Wrap response in Task
      }
      catch (Exception ex)
      {
        _logger.Debug("Error in filtered" + ex.Message);
        _logger.Error("Error in filtered" + ex.StackTrace);

        response.Message = ex.Message.ToString();
        response.Success = false;
        return Task.FromResult(response); // Wrap response in Task
      }
    }

    public async Task<(
      IEnumerable<HolidayWorkSummary> dateWiseMetrics,
      TotalHoursSummary totalHours
    )> GetHolidayWorkSummary(HolidayWorkSummaryRequest request, string division, string project)
    {
      List<HolidayWorkSummary> dateWiseMetrics = new List<HolidayWorkSummary>();
      TotalHoursSummary totalHours = null;
      NpgsqlConnection connection = new NpgsqlConnection(
        _context.Database.GetDbConnection().ConnectionString
      );
      try
      {
        List<string> noticeMessages = new List<string>();

        connection.Notice += (sender, e) =>
        {
          string noticeMessage = e.Notice.MessageText;
          noticeMessages.Add(noticeMessage);
        };

        connection.Open();

        using (NpgsqlCommand command = new NpgsqlCommand("calculate_holiday_summary", connection))
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
          foreach (var message in noticeMessages)
          {
            if (message.StartsWith("Metrics for date:"))
            {
              var parts = message.Split(new[] { ", " }, StringSplitOptions.None);

              var date = parts[0].Split(new[] { ": " }, StringSplitOptions.None)[1];
              var day = parts[1].Split(new[] { ": " }, StringSplitOptions.None)[1];
              var name = parts[2].Split(new[] { ": " }, StringSplitOptions.None)[1];
              var productiveHours = TimeConvert.ConvertToHoursFormat(
                parts[3].Split(new[] { ": " }, StringSplitOptions.None)[1]
              );
              var nonProductiveHours = TimeConvert.ConvertToHoursFormat(
                parts[4].Split(new[] { ": " }, StringSplitOptions.None)[1]
              );
              var loggedHours = TimeConvert.ConvertToHoursFormat(
                parts[5].Split(new[] { ": " }, StringSplitOptions.None)[1]
              );
              var workingHours = TimeConvert.ConvertToHoursFormat(
                parts[6].Split(new[] { ": " }, StringSplitOptions.None)[1]
              );
              var idleHours = TimeConvert.ConvertToHoursFormat(
                parts[7].Split(new[] { ": " }, StringSplitOptions.None)[1]
              );

              var dateMetric = new HolidayWorkSummary
              {
                Date = date,
                Day = day,
                Name = name,
                ProductiveHours = productiveHours,
                NonProductiveHours = nonProductiveHours,
                LoggedHours = loggedHours,
                WorkingHours = workingHours,
                IdleHours = idleHours
              };

              dateWiseMetrics.Add(dateMetric);
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
        }
        return (dateWiseMetrics, totalHours);
      }
      catch (Exception ex)
      {
        _logger.Debug("error in Holiday Summary" + ex.Message);
        _logger.Error("Error in Holiday Summary" + ex.StackTrace);
        return (new List<HolidayWorkSummary>(), new TotalHoursSummary());
      }
      finally
      {
        connection.Close();
      }
    }

    public async Task<BaseResponse<IEnumerable<LoginStatusDTO>>> GetLoginStatus(
      LoginStatus request,
      string email,
      string userrole
    )
    {
      BaseResponse<IEnumerable<LoginStatusDTO>> response = new();
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

        using (NpgsqlCommand cmd = new NpgsqlCommand("user_login_status", connection))
        {
          cmd.CommandType = CommandType.StoredProcedure;

          // Add parameters to the stored procedure
          cmd.Parameters.AddWithValue("p_email", email);
          cmd.Parameters.AddWithValue("p_user_roles", userrole);
          cmd.Parameters.AddWithValue("p_time", request.time);
          cmd.Parameters.AddWithValue("p_user_activity_from_date", request.fromDate); // Adjust with your date
          cmd.Parameters.AddWithValue("p_user_activity_to_date", request.toDate); // Adjust with your date

          await cmd.ExecuteNonQueryAsync();
        }

        if (noticeMessages.Count > 0)
        {
          var formattedMessages = noticeMessages.Select(message =>
          {
            var parts = message.Split(new[] { ", " }, StringSplitOptions.None);
            var date = DateTime.Parse(parts[0].Split(new[] { ": " }, StringSplitOptions.None)[1]);
            var displayName = parts[1].Split(new[] { ": " }, StringSplitOptions.None)[1];
            var team = parts[2].Split(new[] { ": " }, StringSplitOptions.None)[1];
            var jobTitle = parts[3].Split(new[] { ": " }, StringSplitOptions.None)[1];
            var hasActivity = bool.Parse(
              parts[4].Split(new[] { ": " }, StringSplitOptions.None)[1].ToLower()
            );
            var shiftTime = parts[5].Split(new[] { ": " }, StringSplitOptions.None)[1];

            return new LoginStatusDTO
            {
              Date = date,
              UserName = displayName,
              Team = team,
              JobTitle = jobTitle,
              Status = hasActivity,
              ShiftTime = shiftTime
            };
          });

          _logger.Debug("user logging status executed successfully" + formattedMessages);
          response.Message = "user logging status executed successfully";
          response.Success = true;
          response.Data = formattedMessages;
          return response;
        }
        else
        {
          response.Message = "user logging status fail to execute";
          response.Success = false;
          return response;
        }
      }
      catch (Exception ex)
      {
        _logger.Debug("Error in user login status" + ex.Message);
        response.Message = ex.Message.ToString();
        response.Success = false;
        return response;
      }
      finally
      {
        connection.Close();
      }
    }

    public async Task<BaseResponse<List<UserComparisionDTO>>> GetUserComparision(
      UserComparison request
    )
    {
      BaseResponse<List<UserComparisionDTO>> response = new();
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
          NpgsqlCommand command = new NpgsqlCommand("calculate_employee_comparison", connection)
        )
        {
          command.CommandType = CommandType.StoredProcedure;

          command
            .Parameters.AddWithValue("p_user_activity_from_date", request.fromDate)
            .NpgsqlDbType = NpgsqlDbType.Timestamp;
          command.Parameters.AddWithValue("p_user_activity_to_date", request.toDate).NpgsqlDbType =
            NpgsqlDbType.Timestamp;

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
          List<UserComparisionDTO> dateWiseMetrics = new List<UserComparisionDTO>();

          foreach (var message in noticeMessages)
          {
            if (message.StartsWith("User:"))
            {
              var parts = message.Split(new[] { ", " }, StringSplitOptions.None);

              var user = parts[0].Split(new[] { ": " }, StringSplitOptions.None)[1];

              var loggedHours = TimeConvert.ConvertToHoursFormat(
                parts[1].Split(new[] { ": " }, StringSplitOptions.None)[1]
              );
              var idleHours = TimeConvert.ConvertToHoursFormat(
                parts[2].Split(new[] { ": " }, StringSplitOptions.None)[1]
              );
              var workingHours = TimeConvert.ConvertToHoursFormat(
                parts[3].Split(new[] { ": " }, StringSplitOptions.None)[1]
              );
              var productiveMinutes = TimeConvert.ConvertToHoursFormat(
                parts[4].Split(new[] { ": " }, StringSplitOptions.None)[1]
              );
              var nonProductiveMinutes = TimeConvert.ConvertToHoursFormat(
                parts[5].Split(new[] { ": " }, StringSplitOptions.None)[1]
              );

              var userMetrics = new UserComparisionDTO
              {
                User = user,
                LoggedHours = loggedHours,
                IdleHours = idleHours,
                WorkingHours = workingHours,
                ProductiveMinutes = productiveMinutes,
                NonProductiveMinutes = nonProductiveMinutes
              };

              dateWiseMetrics.Add(userMetrics);
            }
          }

          response.Data = dateWiseMetrics;
          _logger.Debug("User comparison summary executed successfully");
          response.Message = "User comparison summary executed successfully";
          response.Success = true;

          return response;
        }
        else
        {
          response.Message = "No data found for the given criteria.";
          response.Success = false;
          response.Data = null; // Optionally set Data to null if no data was found.
          return response;
        }
      }
      catch (Exception ex)
      {
        _logger.Debug(ex.Message + " Error in GetUserComparision");
        response.Message = ex.Message.ToString();
        response.Success = false;
        return response;
      }
    }

    public async Task<BaseResponse<IEnumerable<object>>> GetUserRecording(
      string email,
      DateTime fromDate,
      DateTime toDate
    )
    {
      BaseResponse<IEnumerable<object>> response = new();
      try
      {
        var localADUsername = await _context
          .UserDatas.Where(u => u.Email == email)
          .Select(u => u.LocalADUserName)
          .FirstOrDefaultAsync();

        var displayName = await _context
          .UserDatas.Where(u => u.Email == email)
          .Select(u => u.DisplayName)
          .FirstOrDefaultAsync();

        if (localADUsername == null)
        {
          response.Message = " User not Found";
          return response;
        }

        var utcFromDate = fromDate.ToUniversalTime();
        var utcToDate = toDate.ToUniversalTime().AddDays(1);

        var responseList = new List<object>();

        var images = _context
          .ActiveApplications.Where(u =>
            u.UserActivityUserName == localADUsername
            && u.UserActivityCurrentDateTime.ToUniversalTime() >= utcFromDate
            && u.UserActivityCurrentDateTime.ToUniversalTime() < utcToDate
            && u.ScreenshotPath != null
          )
          .OrderBy(u => u.UserActivityCurrentDateTime)
          .ToList();

        var baseOutputPath = Path.Combine(
          Directory.GetParent(Directory.GetCurrentDirectory()).FullName,
          "Screenshots"
        );

        _logger.Debug("BaseOutputPath" + "" + baseOutputPath);

        var allDatesInRange = Enumerable
          .Range(0, 1 + toDate.Subtract(fromDate).Days)
          .Select(offset => fromDate.Date.AddDays(offset));

        foreach (var date in allDatesInRange)
        {
          var currentDateImages = images
            .Where(img =>
              img.UserActivityCurrentDateTime >= date.ToUniversalTime()
              && img.UserActivityCurrentDateTime < date.ToUniversalTime().AddDays(1)
              && img.ScreenshotPath != null
            )
            .OrderBy(img => img.RecordDateTime)
            .ToList();

          _logger.Debug("CurrentImages" + currentDateImages);

          if (currentDateImages.Count == 0)
          {
            responseList.Add(
              new
              {
                Date = date.ToString("yyyy-MM-dd"),
                DisplayName = displayName,
                VideoFile = "no images found"
              }
            );
            continue;
          }

          var dateFolder = Path.Combine(
            baseOutputPath,
            date.Year.ToString(),
            date.ToString("MM"),
            date.ToString("dd")
          );
          var userFolder = Path.Combine(dateFolder, localADUsername);
          var slideshowsFolder = Path.Combine(userFolder, $"{localADUsername}_Videos");
          Directory.CreateDirectory(slideshowsFolder);
          try
          {
            _logger.Debug("Date Folder: " + dateFolder);

            var imagePaths = currentDateImages
              .Select(img => Path.Combine(baseOutputPath, img.ScreenshotPath))
              .ToArray();

            _logger.Debug("Imagepaths" + imagePaths);

            var outputVideoPath = Path.Combine(
              slideshowsFolder,
              $"{displayName}_{date:yyyy-MM-dd}_slideshow.mp4"
            );

            var apiUrl = _configuration["VideoApi:Url"];
            var httpClient = new HttpClient();

            var requestData = new
            {
              image_folder = imagePaths,
              output_video_path = outputVideoPath,
              fps = 2 // Adjust FPS value as needed
            };

            var jsonRequestData = JsonConvert.SerializeObject(requestData);
            var content = new StringContent(jsonRequestData, Encoding.UTF8, "application/json");

            var result = await httpClient.PostAsync(apiUrl, content);

            if (result.IsSuccessStatusCode)
            {
              var responseContent = await result.Content.ReadAsStringAsync();

              var responseObject = JsonConvert.DeserializeObject<VideoResponse>(responseContent);
              var base64Video = responseObject.video_base64;

              responseList.Add(
                new
                {
                  Date = date.ToString("yyyy-MM-dd"),
                  DisplayName = displayName,
                  VideoFile = base64Video
                }
              );
            }
            else
            {
              // Handle API call failure
              responseList.Add(
                new
                {
                  Date = date.ToString("yyyy-MM-dd"),
                  DisplayName = displayName,
                  VideoFile = (FileContentResult)null
                }
              );
            }
          }
          catch (Exception ex)
          {
            _logger.Debug(
              $"Error generating video for date {date.ToString("yyyy-MM-dd")}: {ex.Message}"
            );
            response.Message = ex.Message.ToString();
            response.Success = false;
            return response;
          }
        }
        response.Message = "User Recording Executed Successfully";
        response.Success = true;
        response.Data = responseList;
        return response;
      }
      catch (Exception ex)
      {
        response.Message = ex.Message.ToString();
        response.Success = false;
        return response;
      }
    }

    public async Task<BaseResponse<IEnumerable<WorkingPatternDTO>>> GetWorkingPattern(
      WorkingPattern request,
      string email
    )
    {
      BaseResponse<IEnumerable<WorkingPatternDTO>> response = new();
      NpgsqlConnection connection = new NpgsqlConnection(
        _context.Database.GetDbConnection().ConnectionString
      );

      try
      {
        List<string> noticeMessages = new List<string>();

        connection.Notice += (sender, e) =>
        {
          string noticeMessage = e.Notice.MessageText;
          noticeMessages.Add(noticeMessage);
        };

        connection.Open();
        DateTime BeforeQuery = DateTime.Now;
        Console.WriteLine($"Query execution started at login pattern: {BeforeQuery}");
        _logger.Debug("Before Execution of login pattern : " + BeforeQuery);

        using (NpgsqlCommand command = new NpgsqlCommand("calculate_login_pattern", connection))
        {
          command.CommandType = CommandType.StoredProcedure;

          command.Parameters.AddWithValue("p_email", email);
          command
            .Parameters.AddWithValue("p_user_activity_from_date", request.fromDate)
            .NpgsqlDbType = NpgsqlDbType.Timestamp;
          command.Parameters.AddWithValue("p_user_activity_to_date", request.toDate).NpgsqlDbType =
            NpgsqlDbType.Timestamp;

          await command.ExecuteNonQueryAsync();

          DateTime AfterQuery = DateTime.Now;

          _logger.Debug("After Execution of login pattern : " + AfterQuery);
        }

        if (noticeMessages.Count > 0)
        {
          var formattedMessages = noticeMessages.Select(message =>
          {
            var parts = message.Split(new[] { ", " }, StringSplitOptions.None);
            var date = parts[0].Split(new[] { ": " }, StringSplitOptions.None)[1];
            var username = parts[1].Split(new[] { ": " }, StringSplitOptions.None)[1].Trim('"');
            var loggedInTimeString = TimeConvert.ConvertToHoursFormat(
              parts[2].Split(new[] { ": " }, StringSplitOptions.None)[1].Trim('"')
            );
            var loggedOutTimeString = TimeConvert.ConvertToHoursFormat(
              parts[3].Split(new[] { ": " }, StringSplitOptions.None)[1].Trim('"')
            );

            return new WorkingPatternDTO
            {
              Date = date,
              Username = username,
              LoggedInTime = loggedInTimeString,
              LoggedOutTime = loggedOutTimeString
            };
          });
          _logger.Debug("Working pattern graph executed successfully" + formattedMessages);
          response.Message = "Working pattern graph executed successfully";
          response.Success = true;
          response.Data = formattedMessages;
          return response;
        }
        else
        {
          response.Message = "Working pattern graph executed failed";
          response.Success = false;
          return response;
        }
      }
      catch (Exception ex)
      {
        _logger.Debug("Error in working pattern graph" + ex.Message);

        _logger.Error("Error in Working Pattern Graph" + ex.StackTrace);
        response.Message = ex.Message.ToString();
        response.Success = false;
        return response;
      }
      finally
      {
        connection.Close();
      }
    }
  }
}
