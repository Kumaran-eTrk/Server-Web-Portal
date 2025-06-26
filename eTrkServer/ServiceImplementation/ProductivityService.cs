using eTrkServer.DTO.RequestDTO;
using eTrkServer.Entity;
using eTrkServer.Interface;
using eTrkServer.Utils;
using Microsoft.EntityFrameworkCore;

namespace eTrkServer.ServiceImplementation
{
  public class ProductivityService : IProductivityService
  {
    private readonly AppDbContext _context;
    private readonly Serilog.ILogger _logger;

    public ProductivityService(AppDbContext context, Serilog.ILogger logger)
    {
      _context = context;
      _logger = logger;
    }

    public Task<BaseResponse<string>> CreateApplication(string username, ApplicationMaster request)
    {
      BaseResponse<string> response = new BaseResponse<string>();
      try
      {
        var existingApp = _context.ApplicationMaster.FirstOrDefault(a =>
          a.ApplicationName == request.ApplicationName
        );

        if (existingApp != null)
        {
          response.Message =
            "Application with the same name already exists : " + existingApp.ApplicationName;
          response.Success = false;
          return Task.FromResult(response);
        }

        var application = new ApplicationMaster
        {
          Id = Guid.NewGuid().ToString(),
          ApplicationName = request.ApplicationName,
          AlternativeName = request.AlternativeName,
          ModifiedBy = username,
          ModifiedDatetime = DateTime.UtcNow
        };

        _context.ApplicationMaster.Add(application);
        _context.SaveChanges();
        response.Message = "Application created successfully";
        response.Success = true;
        return Task.FromResult(response);
      }
      catch (Exception ex)
      {
        response.Message = ex.Message.ToString();
        response.Success = false;
        return Task.FromResult(response);
      }
    }

    public Task<BaseResponse<string>> DeleteApplication(string Id)
    {
      BaseResponse<string> response = new BaseResponse<string>();
      try
      {
        var applicationToDelete = _context.ApplicationMaster.FirstOrDefault(a => a.Id == Id);

        if (applicationToDelete == null)
        {
          response.Message = "Application with ID not found: " + Id;
          response.Success = false;
          return Task.FromResult(response);
        }

        _context.ApplicationMaster.Remove(applicationToDelete);
        _context.SaveChanges();
        response.Message = "Application deleted successfully";
        response.Success = true;
        return Task.FromResult(response);
      }
      catch (Exception ex)
      {
        response.Message = ex.Message.ToString();
        response.Success = false;
        return Task.FromResult(response);
      }
    }

    public Task<BaseResponse<object>> GetProjectMapping(string projectId)
    {
      BaseResponse<object> response = new BaseResponse<object>();

      try
      {
        var projectMappings = _context
          .ProjectApplications.Where(pa => pa.ProjectId == projectId)
          .Include(pa => pa.App)
          .ToList();

        if (projectMappings.Count == 0)
        {
          response.Message = "No project mappings found for the provided project ID";
          response.Success = false;
          return Task.FromResult(response);
        }

        // Get the project name corresponding to the projectId
        var projectName = _context
          .ProjectMaster.Where(p => p.Id == projectId)
          .Select(p => p.ProjectName)
          .FirstOrDefault();

        // Extract application information
        var applicationInfos = projectMappings
          .Select(pa => new ApplicationInfo
          {
            ApplicationId = pa.ApplicationId,
            ApplicationName = pa.App.ApplicationName,
            AlternativeName = pa.App.AlternativeName,
            Productive = pa.Productive,
            ModifiedBy = pa.ModifiedBy,
            ModifiedDatetime = pa.ModifiedDatetime
          })
          .ToList();

        var firstProjectMapping = projectMappings.FirstOrDefault();
        var modifiedBy = firstProjectMapping?.ModifiedBy;
        var modifiedDatetime = firstProjectMapping?.ModifiedDatetime ?? DateTime.MinValue;

        // Create project mapping response
        var projectMappingResponse = new ProjectMapping
        {
          ProjectId = projectId,
          ProjectName = projectName,
          Applications = applicationInfos,
        };

        response.Message = "Project Mapping Retrieved Successfully";
        response.Success = true;
        response.Data = projectMappingResponse;
        return Task.FromResult(response);
      }
      catch (Exception ex)
      {
        _logger.Debug("Error in retrieving project applications : " + ex.Message);
        _logger.Error("Error in retrieving project applications : " + ex.StackTrace);
        response.Message = ex.Message.ToString();
        response.Success = false;
        response.Data = null;
        return Task.FromResult(response);
      }
    }

    public Task<BaseResponse<IEnumerable<string>>> GetUnMacthedApplications()
    {
      BaseResponse<IEnumerable<string>> response = new BaseResponse<IEnumerable<string>>();
      try
      {
        var currentDate = DateTime.Now.Date;
        var fromUtc = new DateTime(
          currentDate.Year,
          currentDate.Month,
          currentDate.Day,
          0,
          0,
          0,
          DateTimeKind.Utc
        ).AddDays(-2);
        var toUtc = new DateTime(
          currentDate.Year,
          currentDate.Month,
          currentDate.Day,
          23,
          59,
          59,
          DateTimeKind.Utc
        );

        var applications = _context.ApplicationMaster.Select(a => a.ApplicationName).ToList();

        var appSet = new HashSet<string>(applications);

        var unmatchedNames = _context
          .ActiveApplications.Where(aa =>
            aa.ScreenshotPath != null
            && aa.ApplicationName != null
            && aa.UserActivityCurrentDateTime >= fromUtc
            && aa.UserActivityCurrentDateTime <= toUtc
            && !appSet.Contains(aa.ApplicationName)
          )
          .Select(aa => aa.ApplicationName)
          .Distinct()
          .ToList();

        _logger.Information("getting unmatched applications successfully");
        response.Message = "unmatched applications retrieved successfully";
        response.Success = true;
        response.Data = unmatchedNames;
        return Task.FromResult(response);
      }
      catch (Exception ex)
      {
        _logger.Debug("Error in getting unmatched applications : " + ex.Message);
        _logger.Error("Error in getting unmatched applications : " + ex.StackTrace);
        response.Message = ex.Message.ToString();
        response.Success = true;
        response.Data = null;
        return Task.FromResult(response);
      }
    }

    public async Task<BaseResponse<List<ProjectApplications>>> PostProjectMapping(
      string username,
      ProjectMappingDto request
    )
    {
      BaseResponse<List<ProjectApplications>> response =
        new BaseResponse<List<ProjectApplications>>();
      List<ProjectApplications> addedMappings = new List<ProjectApplications>();

      try
      {
        var allProjects = _context.ProjectMaster.ToList();
        var chosenProjects = request.ProjectId;
        var givenApplications = request.ApplicationIds;

        foreach (var project in allProjects)
        {
          // If the project is in the chosen projects list
          if (chosenProjects.Contains(project.Id))
          {
            foreach (var applicationId in givenApplications)
            {
              // Check if a mapping already exists
              var existingMapping = _context.ProjectApplications.FirstOrDefault(p =>
                p.ApplicationId == applicationId && p.ProjectId == project.Id
              );

              if (existingMapping == null)
              {
                // Create a new mapping if it doesn't exist
                var projectMapping = new ProjectApplications
                {
                  Id = Guid.NewGuid().ToString(),
                  ApplicationId = applicationId,
                  ProjectId = project.Id,
                  Productive = request.Productive,
                  ModifiedBy = username,
                  ModifiedDatetime = DateTime.UtcNow
                };

                _context.ProjectApplications.Add(projectMapping);
                addedMappings.Add(projectMapping); // Track the added mappings
              }
              else
              {
                response.Message = $"Application with project {project.Id} already exists.";
                response.Success = false;
                return response;
              }
            }
          }
          // If the project is NOT in the chosen projects list
          else
          {
            foreach (var applicationId in givenApplications)
            {
              // Check if a mapping already exists
              var existingMapping = _context.ProjectApplications.FirstOrDefault(p =>
                p.ApplicationId == applicationId && p.ProjectId == project.Id
              );

              if (existingMapping == null)
              {
                var projectMapping = new ProjectApplications
                {
                  Id = Guid.NewGuid().ToString(),
                  ApplicationId = applicationId,
                  ProjectId = project.Id,
                  Productive = !request.Productive, // Mark as opposite productive
                  ModifiedBy = username,
                  ModifiedDatetime = DateTime.UtcNow
                };

                _context.ProjectApplications.Add(projectMapping);
                addedMappings.Add(projectMapping); // Track the added mappings
              }
            }
          }
        }

        // Save the changes to the database
        await _context.SaveChangesAsync();

        // Set up the response
        response.Data = addedMappings; // Return the list of added mappings
        response.Message = "Project mappings added successfully";
        response.Success = true;

        return response;
      }
      catch (Exception ex)
      {
        // In case of an error, log and return the message
        response.Message = $"Error: {ex.Message}";
        response.Success = false;
        return response;
      }
    }

    public Task<BaseResponse<string>> UpdateApplication(
      string Id,
      string username,
      ApplicationUpdate request
    )
    {
      BaseResponse<string> response = new BaseResponse<string>();
      try
      {
        var existingApplication = _context.ApplicationMaster.FirstOrDefault(p => p.Id == Id);

        if (existingApplication == null)
        {
          response.Message = "Applications not found";
          response.Success = false;
          return Task.FromResult(response);
        }

        existingApplication.AlternativeName = request.AlternativeName;
        existingApplication.ModifiedBy = username;
        existingApplication.ModifiedDatetime = DateTime.UtcNow;

        _context.ApplicationMaster.Update(existingApplication);
        _context.SaveChanges();

        _logger.Information("Applications updated successfully");
        response.Message = "Applications updated successfully";
        response.Success = true;
        return Task.FromResult(response);
      }
      catch (Exception ex)
      {
        _logger.Debug("Error in updating Applications  : " + ex.Message);
        _logger.Error("Error in updating Applications  : " + ex.StackTrace);
        response.Message = ex.Message.ToString();
        response.Success = false;
        return Task.FromResult(response);
      }
    }

    public Task<BaseResponse<string>> UpdateProjectApplication(
      string username,
      UpdateProjectApplicationsRequest request
    )
    {
      BaseResponse<string> response = new BaseResponse<string>();

      try
      {
        var projectMapping = _context.ProjectApplications.FirstOrDefault(pa =>
          pa.ProjectId == request.projectId && pa.ApplicationId == request.applicationId
        );

        if (projectMapping == null)
        {
          response.Message =
            "Project mapping not found for the provided project ID and application ID.";
          response.Success = false;
          return Task.FromResult(response);
        }

        projectMapping.ModifiedBy = username;
        projectMapping.Productive = request.newProductivity;
        projectMapping.ModifiedDatetime = DateTime.UtcNow;

        _context.SaveChanges();
        response.Message = "Productivity updated successfully.";
        response.Success = true;
        return Task.FromResult(response);
      }
      catch (Exception ex)
      {
        _logger.Debug("Error in updating application productivity : " + ex.Message);
        _logger.Error("Error in updating application productivity : " + ex.StackTrace);
        response.Message = ex.Message.ToString();
        response.Success = false;
        return Task.FromResult(response);
      }
    }
  }
}
