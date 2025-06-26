using System.Text;
using eTrkServer.DTO.RequestDTO;
using eTrkServer.DTO.ResponseDTO;
using eTrkServer.Entity;
using eTrkServer.Helpers;
using eTrkServer.Interface;
using eTrkServer.Utils;
using Microsoft.EntityFrameworkCore;

namespace eTrkServer.ServiceImplementation
{
  public class ExtensionService : IExtensionService
  {
    private readonly AppDbContext _context;

    private readonly EmailService _emailService;

    public ExtensionService(AppDbContext context, EmailService emailService)
    {
      _context = context;
      _emailService = emailService;
    }

    public async Task<BaseResponse<string>> CreateExtensionAsync(ExtensionPost extensionPostDto)
    {
      BaseResponse<string> response = new BaseResponse<string>();
      try
      {
        var existingExtension = await _context.MasterExtension.FirstOrDefaultAsync(e =>
          e.name == extensionPostDto.name && e.version == extensionPostDto.version
        );

        if (existingExtension != null)
        {
          response.Message = "Extension with the same name and version already exists.";
          response.Success = false;
          return response;
        }
        var newMasterExtension = new Extension
        {
          Id = Guid.NewGuid().ToString(),
          name = extensionPostDto.name,
          version = extensionPostDto.version,
          Status = (AcceptanceStatus)extensionPostDto.status,
        };

        _context.MasterExtension.Add(newMasterExtension);
        await _context.SaveChangesAsync();
        response.Message = "Extension Saved Successfully";
        response.Success = true;
        return response;
      }
      catch (Exception ex)
      {
        response.Message = ex.Message.ToString();
        response.Success = false;
        return response;
      }
    }

    public Task<BaseResponse<List<GetExtensions>>> GetUnknownExtensionAsync()
    {
      BaseResponse<List<GetExtensions>> response = new BaseResponse<List<GetExtensions>>();
      try
      {
        var extensions = _context
          .MasterExtension.Where(e => e.Status == AcceptanceStatus.unknown)
          .Select(e => new GetExtensions
          {
            Id = e.Id,
            Name = e.name,
            Version = e.version,
            Browser = e.UserExtensions.FirstOrDefault().browser,
            Permissions = e.UserExtensions.FirstOrDefault().permissions
          })
          .ToList();

        response.Message = "Unknown extensions retrieved successfully";
        response.Success = true;
        response.Data = extensions;
      }
      catch (Exception ex)
      {
        response.Message = ex.Message.ToString();
        response.Success = false;
      }
      return Task.FromResult(response);
    }

    public Task<BaseResponse<List<GetExtensions>>> GetAcceptedExtensionAsync()
    {
      BaseResponse<List<GetExtensions>> response = new BaseResponse<List<GetExtensions>>();
      try
      {
        var extensions = _context
          .MasterExtension.Where(e => e.Status == AcceptanceStatus.accepted)
          .Select(e => new GetExtensions
          {
            Id = e.Id,
            Name = e.name,
            Version = e.version,
            Browser = e.UserExtensions.FirstOrDefault().browser,
            Permissions = e.UserExtensions.FirstOrDefault().permissions
          })
          .ToList();

        response.Message = "Accepted extensions retrieved successfully";
        response.Success = true;
        response.Data = extensions;
      }
      catch (Exception ex)
      {
        response.Message = ex.Message.ToString();
        response.Success = false;
      }
      return Task.FromResult(response);
    }

    public Task<BaseResponse<List<GetExtensions>>> GetRejectedExtensionAsync()
    {
      BaseResponse<List<GetExtensions>> response = new BaseResponse<List<GetExtensions>>();
      try
      {
        var extensions = _context
          .MasterExtension.Where(e => e.Status == AcceptanceStatus.rejected)
          .Select(e => new GetExtensions
          {
            Id = e.Id,
            Name = e.name,
            Version = e.version,
            Browser = e.UserExtensions.FirstOrDefault().browser,
            Permissions = e.UserExtensions.FirstOrDefault().permissions
          })
          .ToList();

        response.Message = "Rejected extensions retrieved successfully";
        response.Success = true;
        response.Data = extensions;
      }
      catch (Exception ex)
      {
        response.Message = ex.Message.ToString();
        response.Success = false;
      }
      return Task.FromResult(response);
    }

    public async Task<BaseResponse<string>> UpdateExtensionAsync(
      string extensionId,
      string username,
      ExtensionStatusUpdateDto request
    )
    {
      BaseResponse<string> response = new BaseResponse<string>();
      try
      {
        var extension = await _context.MasterExtension.FirstOrDefaultAsync(x =>
          x.Id == extensionId
        );

        if (extension == null)
        {
          response.Message = "Extension not Found";
          response.Success = false;
          return response;
        }

        // Update the status
        extension.Status = (AcceptanceStatus)request.Status;
        _context.MasterExtension.Update(extension);

        var latestHistory = await _context
          .ExtensionHistory.Where(h => h.ExtensionID == extensionId)
          .OrderByDescending(h => h.modifieddatetime)
          .FirstOrDefaultAsync();

        int majorVersion = 0;
        int minorVersion = 0;

        if (latestHistory != null && !string.IsNullOrEmpty(latestHistory.updateversion))
        {
          var versionParts = latestHistory.updateversion.Split('.');

          if (versionParts.Length >= 2)
          {
            majorVersion = int.Parse(versionParts[0]);
            minorVersion = int.Parse(versionParts[1]);
          }
        }

        // Increment the version
        minorVersion++;

        if (minorVersion == 10)
        {
          minorVersion = 0;
          majorVersion++;
        }

        string newVersion = $"{majorVersion}.{minorVersion}";

        var newHistory = new History
        {
          ExtensionID = extensionId,
          remarks = request.Remarks,
          updateversion = newVersion,
          modifiedbyuser = username,
          modifieddatetime = DateTime.UtcNow,
          // Add other properties as needed
        };

        _context.ExtensionHistory.Add(newHistory);
        await _context.SaveChangesAsync();
        if ((AcceptanceStatus)request.Status == AcceptanceStatus.rejected)
        {
          // Find users associated with the rejected extension
          var users = await _context
            .UserExtension.Where(x => x.ExtensionID == extensionId)
            .Select(x => x.username)
            .ToListAsync();

          // Send email notifications to users
          foreach (var user in users)
          {
            var userData = await _context.UserDatas.FirstOrDefaultAsync(x =>
              x.LocalADUserName == user
            );
            if (userData != null && !string.IsNullOrEmpty(userData.Email))
            {
              if (userData != null && !string.IsNullOrEmpty(userData.Email))
              {
                StringBuilder emailBody = new StringBuilder();
                emailBody.AppendLine("<html><body>");
                emailBody.AppendLine($"<p>Dear {userData.DisplayName},</p>");
                emailBody.AppendLine("<div style=\"padding: 1rem;\">");
                emailBody.AppendLine(
                  "<p style=\"font-weight: bold; color: #D80032;\">Emergency Notification:</p>"
                );
                emailBody.AppendLine(
                  "<p>We have identified issues with the extensions associated with your account in our system. These extensions pose a security risk to your system.</p>"
                );
                emailBody.AppendLine($"<li>Extension: <strong>{extension.name}</strong></li>");
                emailBody.AppendLine(
                  "<p style=\"font-weight: bold; color: #D80032;\">Action Required:</p>"
                );
                emailBody.AppendLine(
                  "<p style=\"color: #D80032;\">Please uninstall the mentioned extension immediately to ensure the security of your system.</p>"
                );
                emailBody.AppendLine("</div>");
                emailBody.AppendLine("<p>Regards,</p>");
                emailBody.AppendLine("<p>System Admin Team</p>");
                emailBody.AppendLine("</body></html>");

                await _emailService.SendRejectionEmailAsync(userData.Email, emailBody.ToString());
              }
            }
          }
        }
        response.Message = "Extension status updated successfully";
        response.Success = true;
        return response;
      }
      catch (Exception ex)
      {
        response.Message = ex.Message.ToString();
        response.Success = false;
        return response;
      }
    }

    public async Task<BaseResponse<List<History>>> GetHistoryByExtensionId(string extensionId)
    {
      BaseResponse<List<History>> response = new BaseResponse<List<History>>();
      try
      {
        var historyRecords = await _context
          .ExtensionHistory.Where(h => h.ExtensionID == extensionId)
          .ToListAsync();

        // If no history records found, return 404 Not Found
        if (historyRecords == null || !historyRecords.Any())
        {
          response.Message = "Extension is not found";
          return response;
        }
        response.Message = "History retrieved successfully";
        response.Success = true;
        response.Data = historyRecords;
        return response;
      }
      catch (Exception ex)
      {
        response.Message = ex.Message.ToString();
        response.Success = false;
        return response;
      }
    }

    public Task<BaseResponse<List<RejectedExtensionDto>>> GetRejectedUsage()
    {
      BaseResponse<List<RejectedExtensionDto>> response =
        new BaseResponse<List<RejectedExtensionDto>>();
      try
      {
        var rejectedExtensions = _context
          .MasterExtension.Include(e => e.UserExtensions)
          .Where(e => e.Status == AcceptanceStatus.rejected)
          .ToList();

        var result = rejectedExtensions
          .Select(e => new RejectedExtensionDto
          {
            ExtensionName = e.name,
            Version = e.version,
            Status = GetStatus.GetStatusString((int)e.Status),
            Users = e
              .UserExtensions.Select(u => new UserDto
              {
                Username = u.username,
                Permissions = u.permissions,
                Browser = u.browser,
                StartDateTime = u.startdatetime,
                ModifiedDateTime = u.modifieddatetime
              })
              .ToList()
          })
          .ToList();
        response.Message = "RejectedUsage retrived successfully";
        response.Success = true;
        response.Data = result;
      }
      catch (Exception ex)
      {
        response.Message = ex.Message.ToString();
        response.Success = false;
      }

      return Task.FromResult(response);
    }
  }
}
