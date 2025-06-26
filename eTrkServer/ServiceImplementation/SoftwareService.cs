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
  public class SoftwareService : ISoftwareService
  {
    private readonly AppDbContext _context;

    private readonly EmailService _emailService;

    public SoftwareService(AppDbContext context, EmailService emailService)
    {
      _context = context;
      _emailService = emailService;
    }

    public async Task<BaseResponse<string>> CreateSoftwareAsync(SoftwarePostDto softwarePostDto)
    {
      BaseResponse<string> response = new BaseResponse<string>();
      try
      {
        var existingSoftware = await _context.MasterSoftware.FirstOrDefaultAsync(e =>
          e.Name == softwarePostDto.Name && e.Version == softwarePostDto.Version
        );

        if (existingSoftware != null)
        {
          response.Message = "Extension with the same name and version already exists.";
          response.Success = false;
          return response;
        }
        var newMasterSoftware = new Software
        {
          Id = Guid.NewGuid().ToString(),
          Name = softwarePostDto.Name,
          Version = softwarePostDto.Version,
          Status = (AcceptanceStatus)softwarePostDto.Status,
        };

        _context.MasterSoftware.Add(newMasterSoftware);
        await _context.SaveChangesAsync();
        response.Message = "Software Saved Successfully";
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

    public Task<BaseResponse<List<GetSoftwares>>> GetAcceptedSoftwareAsync()
    {
      BaseResponse<List<GetSoftwares>> response = new BaseResponse<List<GetSoftwares>>();

      try
      {
        var extensions = _context
          .MasterSoftware.Where(e => e.Status == AcceptanceStatus.accepted)
          .Select(e => new GetSoftwares
          {
            Id = e.Id,
            Name = e.Name,
            Version = e.Version,
          })
          .ToList();

        response.Message = "Accepted softwares retrieved successfully";
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

    public async Task<BaseResponse<List<SoftwareHistory>>> GetHistoryBySoftwareId(string softwareId)
    {
      BaseResponse<List<SoftwareHistory>> response = new BaseResponse<List<SoftwareHistory>>();
      try
      {
        var historyRecords = await _context
          .SoftwareHistory.Where(h => h.SoftwareID == softwareId)
          .ToListAsync();

        // If no history records found, return 404 Not Found
        if (historyRecords == null || !historyRecords.Any())
        {
          response.Message = "Software is not found";
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

    public Task<BaseResponse<List<GetSoftwares>>> GetRejectedSoftwareAsync()
    {
      BaseResponse<List<GetSoftwares>> response = new BaseResponse<List<GetSoftwares>>();

      try
      {
        var extensions = _context
          .MasterSoftware.Where(e => e.Status == AcceptanceStatus.rejected)
          .Select(e => new GetSoftwares
          {
            Id = e.Id,
            Name = e.Name,
            Version = e.Version,
          })
          .ToList();

        response.Message = "Rejected softwares retrieved successfully";
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

    public Task<BaseResponse<List<RejectedSoftwareDto>>> GetRejectedUsage()
    {
      BaseResponse<List<RejectedSoftwareDto>> response =
        new BaseResponse<List<RejectedSoftwareDto>>();
      try
      {
        var rejectedSoftwares = _context
          .MasterSoftware.Include(e => e.UserSoftwares)
          .Where(e => e.Status == AcceptanceStatus.rejected)
          .ToList();

        var result = rejectedSoftwares
          .Select(e => new RejectedSoftwareDto
          {
            SoftwareName = e.Name,
            Version = e.Version,
            Status = GetStatus.GetStatusString((int)e.Status),
            Users = e
              .UserSoftwares.Select(u => new UserSoftwareDto
              {
                Username = u.UserName,

                StartDateTime = u.InstalledDate,
                ModifiedDateTime = u.ModifiedDateTime
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

    public Task<BaseResponse<List<GetSoftwares>>> GetUnknownSoftwareAsync()
    {
      BaseResponse<List<GetSoftwares>> response = new BaseResponse<List<GetSoftwares>>();

      try
      {
        var extensions = _context
          .MasterSoftware.Where(e => e.Status == AcceptanceStatus.unknown)
          .Select(e => new GetSoftwares
          {
            Id = e.Id,
            Name = e.Name,
            Version = e.Version,
          })
          .ToList();

        response.Message = "Unknown softwares retrieved successfully";
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

    public async Task<BaseResponse<string>> UpdateSoftwareAsync(
      string softwareId,
      string username,
      SoftwareStatusUpdateDto request
    )
    {
      BaseResponse<string> response = new BaseResponse<string>();
      try
      {
        var software = await _context.MasterSoftware.FirstOrDefaultAsync(x => x.Id == softwareId);

        if (software == null)
        {
          response.Message = "Software not found";
          return response;
        }

        // Update the status
        software.Status = (AcceptanceStatus)request.Status;
        _context.MasterSoftware.Update(software);

        var latestHistory = await _context
          .SoftwareHistory.Where(h => h.SoftwareID == softwareId)
          .OrderByDescending(h => h.ModifiedDateTime)
          .FirstOrDefaultAsync();

        int majorVersion = 0;
        int minorVersion = 0;

        if (latestHistory != null && !string.IsNullOrEmpty(latestHistory.EditVersion))
        {
          var versionParts = latestHistory.EditVersion.Split('.');

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

        var newHistory = new SoftwareHistory
        {
          SoftwareID = softwareId,
          Remarks = request.Remarks,
          EditVersion = newVersion,
          ModifiedByUser = username,
          ModifiedDateTime = DateTime.UtcNow,
          // Add other properties as needed
        };

        _context.SoftwareHistory.Add(newHistory);
        await _context.SaveChangesAsync();

        if ((AcceptanceStatus)request.Status == AcceptanceStatus.rejected)
        {
          // Find users associated with the rejected extension
          var users = await _context
            .UserSoftwares.Where(x => x.SoftwareID == softwareId)
            .Select(x => x.UserName)
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
                emailBody.AppendLine($"<li>Extension: <strong>{software.Name}</strong></li>");
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
        response.Message = "Software status updated successfully";
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
  }
}
