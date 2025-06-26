using System;
using System.IO;
using System.Runtime.CompilerServices;
using eTrkServer.DTO.RequestDTO;
using eTrkServer.DTO.ResponseDTO;
using eTrkServer.Entity;
using eTrkServer.Helpers;
using eTrkServer.Interface;
using eTrkServer.Utils;
using Microsoft.EntityFrameworkCore;
using SkiaSharp;

namespace eTrkServer.ServiceImplementation
{
  public class UserMonitorService : IUserMonitorService
  {
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _webHostEnvironment;
    private readonly Serilog.ILogger _logger;
    private readonly IConfiguration _configuration;
    private bool takeScreenshots;

    public UserMonitorService(
      AppDbContext context,
      IConfiguration configuration,
      IWebHostEnvironment hostingEnvironment,
      Serilog.ILogger logger
    )
    {
      _context = context;
      _webHostEnvironment = hostingEnvironment;
      _logger = logger;
      _configuration = configuration;
      takeScreenshots = _configuration.GetValue<bool>("Screenshots:TakeScreenshots");
    }

    public async Task<BaseResponse<string>> AppVersion(AppVersion request)
    {
      BaseResponse<string> response = new BaseResponse<string>();
      try
      {
        UserData user = _context
          .UserDatas.Where(x =>
            x.LocalADUserName == request.UserName && x.LocalADDomain == request.DomainName
          )
          .FirstOrDefault();
        user.VersionId = request.Version;
        await _context.SaveChangesAsync();
        _logger.Information("App version sent successfully");
        response.Message = "App version sent successfully";
        response.Success = true;
        response.Data = user.VersionId;
        return response;
      }
      catch (Exception ex)
      {
        _logger.Debug("Unable to send the app version", ex.Message);
        _logger.Error("Error in app version", ex.StackTrace);
        response.Message = ex.Message.ToString();
        response.Success = false;
        response.Data = null;
        return response;
      }
    }

    public Task<BaseResponse<string>> GetExtensions(ExtensionDTo request)
    {
      BaseResponse<string> response = new BaseResponse<string>();
      _logger.Debug("Addrequest - Entering " + request.ToString());

      try
      {
        Extension existingExtension = _context.MasterExtension.FirstOrDefault(x =>
          x.name == request.name && x.version == request.version
        );

        if (existingExtension == null)
        {
          _logger.Debug("Addrequest -> No existing record found in Extensions table");

          // Create a new Extension record
          Extension newExtension = new Extension
          {
            name = request.name,
            version = request.version,
            Status = (AcceptanceStatus)request.Status,
          };

          // Save the new Extension record
          _context.MasterExtension.Add(newExtension);

          // Now that the Extension record is saved, use its ID to create a UserExtension record
          UserExtension newUserExtension = new UserExtension
          {
            ExtensionID = newExtension.Id,
            username = request.username,
            permissions = string.Join(",", request.permissions),
            browser = request.browser,
            startdatetime = DateTime.UtcNow,
            modifieddatetime = request.modifieddatetime,
          };

          _context.UserExtension.Add(newUserExtension);
          _context.SaveChanges();
        }
        else
        {
          _logger.Debug("AddEntityInfo -> Existing record found in Extensions table");

          // Use the existing Extension's ID to create a UserExtension record
          UserExtension existingUserExtension = _context.UserExtension.FirstOrDefault(x =>
            x.ExtensionID == existingExtension.Id && x.username == request.username
          );

          if (existingUserExtension != null)
          {
            // Update the modifieddatetime for the existing UserExtension record
            existingUserExtension.modifieddatetime = DateTime.UtcNow;
            _context.UserExtension.Update(existingUserExtension);
          }
          else
          {
            // Create a new UserExtension record
            UserExtension newUserExtension = new UserExtension
            {
              ExtensionID = existingExtension.Id,
              username = request.username,
              permissions = string.Join(",", request.permissions),
              browser = request.browser,
              startdatetime = DateTime.UtcNow,
              modifieddatetime = request.modifieddatetime,
            };

            _context.UserExtension.Add(newUserExtension);
          }
        }

        _context.SaveChanges();
        response.Message = "Extension Added Successfully";
        response.Success = true;
        response.Data = request.name;
        return Task.FromResult(response);
      }
      catch (Exception ex)
      {
        _logger.Debug("Error in Extension", ex.Message);
        _logger.Error("Error in Extension", ex.StackTrace);
        response.Message = ex.Message.ToString();
        response.Success = false;
        response.Data = request.name;
        return Task.FromResult(response);
      }
    }

    public Task<BaseResponse<string>> GetIpAddress(IPAddressInfo request)
    {
      BaseResponse<string> response = new BaseResponse<string>();
      _logger.Debug("AddIpAddress - Entering " + request.ToString());

      List<IPAddressInfo> iMeta = _context
        .IPAddresses.Where(x => x.UserName == request.UserName && x.IPAddress == request.IPAddress)
        .ToList();

      try
      {
        if (iMeta.Count == 0)
        {
          _logger.Debug("AddIpAddress -> No existing record found");
          _context.IPAddresses.Add(request);
          _context.SaveChanges();
        }
        else
        {
          IPAddressInfo existingIpRecord = iMeta.FirstOrDefault();
          if (existingIpRecord != null)
          {
            existingIpRecord.IPAddress = request.IPAddress;
            existingIpRecord.MacAddress = request.MacAddress;
            existingIpRecord.RecordDateTime = DateTime.UtcNow;
          }
          _logger.Debug("AddIpAddress -> Existing IP Address record found");
          _context.IPAddresses.Update(existingIpRecord);
          _context.SaveChanges();
        }
        response.Message = "IpAddress Retrieved Successfully";
        response.Success = true;
        response.Data = request.UserName;
        return Task.FromResult(response);
      }
      catch (Exception ex)
      {
        _logger.Debug("Error in getting IP Address", ex.Message);
        _logger.Error("Error in getting IP Address", ex.StackTrace);
        response.Message = ex.Message.ToString();
        response.Success = false;
        response.Data = request.UserName;
        return Task.FromResult(response);
      }
    }

    public async Task<BaseResponse<string>> GetLoggingActivity(UserLoggingActivity request)
    {
      _logger.Debug("Entering AddUserLogging" + request.UserName + " : " + request.DomainName);
      BaseResponse<string> response = new BaseResponse<string>();
      try
      {
        List<UserLoggingActivity> ulActivity = _context
          .UserLoggingActivity.Where(x =>
            x.UserName == request.UserName
            && x.DomainName == request.DomainName
            && x.CurrentDateTime.Value.Date == request.CurrentDateTime.Value.Date
          )
          .ToList();
        bool found = false;
        UserLoggingActivity uActivity = null;
        if (ulActivity.Count > 0)
        {
          foreach (var activity in ulActivity)
          {
            _logger.Debug(activity.LastLogonDateTime.ToString());
            if (
              Util.AreDatesEqualUpToMinute(
                (DateTime)activity.LastLogonDateTime,
                (DateTime)request.LastLogonDateTime
              )
            )
            {
              _logger.Debug("Inside Update GUID : " + activity.Id);

              uActivity = activity;
              uActivity.CurrentDateTime = DateTime.UtcNow;
              found = true;
              break;
            }
          }
        }
        if (!found)
        {
          request.Id = Guid.NewGuid().ToString();
          _context.UserLoggingActivity.Add(request);
        }
        else
        {
          _context.UserLoggingActivity.Update(uActivity);
        }

        await _context.SaveChangesAsync();
        response.Message = "LoggingActivity Retrieved Successfully";
        response.Success = true;
        response.Data = request.UserName;
        return response;
      }
      catch (Exception ex)
      {
        _logger.Debug("Error in User logging Activity", ex.Message);
        _logger.Error("Error in User logging Activity", ex.StackTrace);
        response.Message = ex.Message.ToString();
        response.Success = false;
        response.Data = request.UserName;
        return response;
      }
    }

    public Task<BaseResponse<string>> GetSoftwares(Softwareinfo request)
    {
      BaseResponse<string> response = new BaseResponse<string>();
      _logger.Debug("AddSoftwareInfo - Entering " + request.ToString());

      try
      {
        // Check if the extension already exists in the Extensions table
        Software existingExtension = _context.MasterSoftware.FirstOrDefault(x =>
          x.Name == request.Name && x.Version == request.Version
        );

        if (existingExtension == null)
        {
          _logger.Debug("AddSoftwareInfo -> No existing record found in Software table");

          // Create a new Extension record
          Software newSoftware = new Software
          {
            Name = request.Name,
            Version = request.Version,
            Status = (AcceptanceStatus)request.Status,
          };

          // Save the new Extension record
          _context.MasterSoftware.Add(newSoftware);
          _context.SaveChanges();

          // Now that the Extension record is saved, use its ID to create a UserExtension record
          UserSoftwares newUserSoftware = new UserSoftwares
          {
            SoftwareID = newSoftware.Id,
            UserName = request.UserName,
            ModifiedDateTime = DateTime.UtcNow,
            InstalledDate = request.InstalledDate,
          };

          _context.UserSoftwares.Add(newUserSoftware);
        }
        else
        {
          _logger.Debug("AddSoftwareInfo -> Existing record found in Software table");

          // Use the existing Extension's ID to create a UserExtension record
          UserSoftwares existingUserExtension = _context.UserSoftwares.FirstOrDefault(x =>
            x.SoftwareID == existingExtension.Id && x.UserName == request.UserName
          );

          if (existingUserExtension != null)
          {
            // Update the modifieddatetime for the existing UserExtension record
            existingUserExtension.ModifiedDateTime = DateTime.UtcNow;
            _context.UserSoftwares.Update(existingUserExtension);
          }
          else
          {
            // Create a new UserExtension record
            UserSoftwares newUserSoftwares = new UserSoftwares
            {
              SoftwareID = existingExtension.Id,
              UserName = request.UserName,
              ModifiedDateTime = DateTime.UtcNow,
              InstalledDate = request.InstalledDate,
            };

            _context.UserSoftwares.Add(newUserSoftwares);
          }
        }

        _context.SaveChanges();
        response.Message = "Software Added Successfully";
        response.Success = true;
        response.Data = request.Name;
        return Task.FromResult(response);
      }
      catch (Exception ex)
      {
        _logger.Debug("Error in user Softwares ", ex.Message);
        _logger.Error("Error in user Softwares ", ex.StackTrace);
        response.Message = ex.Message.ToString();
        response.Success = false;
        response.Data = request.Name;
        return Task.FromResult(response);
      }
    }

    public async Task<BaseResponse<string>> GetUserActivity(UserActivity userActivity)
    {
      BaseResponse<string> response = new BaseResponse<string>();

      _logger.Information(
        "Entering AddUserActivity :"
          + userActivity.UserName
          + " : "
          + userActivity.DomainName
          + " : "
          + userActivity.CurrentDateTime.Date
      );

      try
      {
        var targetDate = new DateTime(
          userActivity.CurrentDateTime.Year,
          userActivity.CurrentDateTime.Month,
          userActivity.CurrentDateTime.Day
        ).ToUniversalTime();

        var totalIdleTimes = _context
          .UserActivities.Where(y =>
            y.UserName == userActivity.UserName
            && y.DomainName == userActivity.DomainName
            && y.CurrentDateTime == targetDate
          )
          .Select(x => x.TotalIdleTime)
          .ToList();
        _logger.Information(
          "Entering TargetDate :" + targetDate + "Request Date:" + userActivity.CurrentDateTime.Date
        );

        int currDateRecordAvailable = totalIdleTimes.Count;
        var maxIdleTime = totalIdleTimes.DefaultIfEmpty(0).Max();
        _logger.Debug(
          "MaxIdleTime :"
            + maxIdleTime
            + " : "
            + userActivity.TotalIdleTime.ToString()
            + " ----> Total Records Available : "
            + currDateRecordAvailable
        );

        bool dataInserted = false;

        var currDate = userActivity.CurrentDateTime;
        var aDate = new DateTime(currDate.Year, currDate.Month, currDate.Day).ToUniversalTime();

        userActivity.CurrentDateTime = aDate;
        userActivity.BrowserHistory = null;

        if (userActivity.ActiveApplications != null)
        {
          _logger.Debug(
            "Inside the Active Application Loop " + userActivity.ActiveApplications.Count
          );
          foreach (ApplicationUsage applicationUsage in userActivity.ActiveApplications)
          {
            _logger.Debug(
              "Inside the Active Application Loop "
                + applicationUsage.Application
                + " : "
                + userActivity.UserName
                + ":"
                + userActivity.CurrentDateTime.ToUniversalTime()
                + ":"
                + userActivity.DomainName
            );
            applicationUsage.Id = Guid.NewGuid().ToString();
            applicationUsage.ApplicationName = applicationUsage.ApplicationName;
            applicationUsage.UserActivityUserName = userActivity.UserName;
            applicationUsage.UserActivityDomainName = userActivity.DomainName;
            applicationUsage.UserActivityCurrentDateTime = userActivity.CurrentDateTime;
            applicationUsage.StartDateTime = applicationUsage.StartDateTime.Value.ToUniversalTime();
            applicationUsage.EndDateTime = applicationUsage.EndDateTime.Value.ToUniversalTime();
            applicationUsage.RecordDateTime =
              applicationUsage.RecordDateTime.Value.ToUniversalTime();

            if (applicationUsage.Screenshot != null)
            {
              _logger.Debug("Data stored in path");

              DateTime currentDateTimeUtc = DateTime.Now; // Using current UTC date time
              string timestamp = DateTime.Now.ToString("ddMMyyyyHHmmss");
              string screenshotFileName = $"{userActivity.UserName}_{timestamp}.png";

              string screenshotFolderPath = Path.Combine(
                Directory.GetParent(Directory.GetCurrentDirectory()).FullName,
                "Screenshots",
                currentDateTimeUtc.Year.ToString(),
                currentDateTimeUtc.ToString("MM"),
                currentDateTimeUtc.ToString("dd"),
                userActivity.UserName
              );
              _logger.Debug("BasePath" + screenshotFolderPath);
              string localFilePath = Path.Combine(screenshotFolderPath, screenshotFileName);

              if (!Directory.Exists(screenshotFolderPath))
              {
                Directory.CreateDirectory(screenshotFolderPath);
              }

              using (MemoryStream ms = new MemoryStream(applicationUsage.Screenshot))
              {
                using (SKBitmap skBitmap = SKBitmap.Decode(ms))
                {
                  if (skBitmap == null) // If the screenshot is not a valid image
                  {
                    applicationUsage.ScreenshotPath = "default path";
                    applicationUsage.Screenshot = null;
                  }
                  else
                  {
                    // Save the SKBitmap to a file
                    using (SKImage skImage = SKImage.FromBitmap(skBitmap))
                    using (SKData skData = skImage.Encode(SKEncodedImageFormat.Png, 50))
                    using (Stream outputStream = System.IO.File.OpenWrite(localFilePath))
                    {
                      skData.SaveTo(outputStream);
                    }

                    string fullPath = localFilePath.Replace('\\', '/');
                    int index = fullPath.IndexOf("/Screenshots");
                    if (index != -1)
                    {
                      string pathAfterScreenshots = fullPath.Substring(
                        index + "/Screenshots".Length + 1
                      );
                      applicationUsage.ScreenshotPath = pathAfterScreenshots;
                      applicationUsage.Screenshot = null;
                      _logger.Information("Screenshot stored in the path");
                    }
                    else
                    {
                      // Handle case where "/Screenshots" is not found in the path
                      applicationUsage.ScreenshotPath = localFilePath;
                      applicationUsage.Screenshot = null;
                    }
                  }
                }
              }
            }
            else
            {
              applicationUsage.ScreenshotPath = null;
              applicationUsage.Screenshot = null;
            }

            _context.ActiveApplications.Add(applicationUsage);
          }
        }

        if (currDateRecordAvailable == 0)
        {
          _context.UserActivities.Add(userActivity);
          dataInserted = true;
        }
        else
        {
          _logger.Debug("Inside update");
          userActivity.TotalIdleTime = userActivity.TotalIdleTime + maxIdleTime;
          _context.UserActivities.Update(userActivity);
          dataInserted = true;
        }
        if (dataInserted)
          await _context.SaveChangesAsync();

        response.Message = "Useractivity Saved Successfully";
        response.Success = true;
        response.Data = userActivity.UserName;
        return response;
      }
      catch (Exception ex)
      {
        _logger.Debug("Error in getting Applications", ex.Message);
        _logger.Error("Error in getting Applications", ex.StackTrace);

        response.Message = ex.Message.ToString();
        response.Success = false;
        response.Data = userActivity.UserName;
        return response;
      }
    }

    public async Task<BaseResponse<string>> GetUserMetaData(UserMetadata request)
    {
      BaseResponse<string> response = new BaseResponse<string>();

      _logger.Debug($"Entering GetUserMetaData with request: {request}");

      try
      {
        // Validate the incoming request
        if (
          string.IsNullOrEmpty(request.UserName)
          || string.IsNullOrEmpty(request.DomainName)
          || string.IsNullOrEmpty(request.MachineName)
        )
        {
          response.Success = false;
          response.Message = "Invalid request: Missing required parameters.";
          _logger.Warning(
            "Invalid request detected - missing UserName, DomainName, or MachineName."
          );
          return response;
        }

        var existingMetadata = await _context
          .UserMetaData.Where(x =>
            x.UserName == request.UserName
            && x.DomainName == request.DomainName
            && x.MachineName == request.MachineName
          )
          .ToListAsync();

        if (existingMetadata.Count == 0)
        {
          // Add new metadata if none exists
          _context.UserMetaData.Add(request);
          await _context.SaveChangesAsync();

          response.Data = request.UserName; // Return the added username
          response.Success = true;
          response.Message = "User metadata successfully added.";
          _logger.Information($"User metadata for {request.UserName} successfully added.");
        }
        else
        {
          response.Success = false;
          response.Message = "User metadata already exists for the specified user.";
          _logger.Information($"User metadata already exists for {request.UserName}.");
        }

        return response;
      }
      catch (Exception ex)
      {
        _logger.Error($"Error while processing GetUserMetaData: {ex.Message}", ex);
        response.Success = false;
        response.Message = "An error occurred while processing the request.";
        return response;
      }
    }
  }
}
