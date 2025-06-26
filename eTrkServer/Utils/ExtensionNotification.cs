using System.Text;
using eTrkServer.DTO.RequestDTO;
using Microsoft.EntityFrameworkCore;

namespace eTrkServer.Utils;

public class ExtensionNotification : BackgroundService
{
  private readonly IConfiguration _configuration;

  private int backupDelay;

  //private readonly EmailServices _emailService;
  private readonly IServiceScopeFactory _service;
  private readonly Serilog.ILogger _logger;

  public ExtensionNotification(
    IServiceScopeFactory service,
    IConfiguration configuration,
    Serilog.ILogger logger
  )
  {
    _service = service;
    _logger = logger;
    _configuration = configuration;
    backupDelay = _configuration.GetValue<int>("Extension&Software:EmailNotification") * 60000;
  }

  protected override async Task ExecuteAsync(CancellationToken stoppingToken)
  {
    while (!stoppingToken.IsCancellationRequested)
    {
      await Task.Delay(backupDelay, stoppingToken);
      await DoExtensionAsync();
      await DoSoftwareAsync();
    }
  }

  private async Task<string> DoExtensionAsync()
  {
    var scope = _service.CreateScope();

    AppDbContext _context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    EmailService _emailService = scope.ServiceProvider.GetRequiredService<EmailService>();

    _logger.Information("Executing Extension Method");

    DateTime currentDateTime = DateTime.UtcNow;

    // Get all users who have rejected extensions and whose modifieddatetime is equal to the current datetime
    var usersWithRejectedExtensions = _context
      .UserExtension.Include(u => u.Extension)
      .Where(u =>
        u.Extension.Status == AcceptanceStatus.rejected
        && u.modifieddatetime >= currentDateTime.AddMinutes(-1)
      )
      .ToList();
    _logger.Information("Rejectionextesnion" + usersWithRejectedExtensions);

    var extensionsByUser = usersWithRejectedExtensions.GroupBy(u => u.username).ToList();

    foreach (var userGroup in extensionsByUser)
    {
      var userEmail = _context
        .UserDatas.Where(u => u.LocalADUserName == userGroup.Key)
        .Select(u => u.Email)
        .FirstOrDefault();

      if (!string.IsNullOrEmpty(userEmail))
      {
        StringBuilder emailBody = new StringBuilder();
        emailBody.AppendLine($"<html><body>");
        emailBody.AppendLine($"<p>Dear {userGroup.Key},</p>");
        emailBody.AppendLine("<div style=\"   padding: 1rem;\">");
        emailBody.AppendLine(
          "<p style=\"font-weight: bold; color: #D80032;\">Emergency Notification:</p>"
        );
        emailBody.AppendLine(
          "<p>We have identified issues with the extensions associated with your account in our system. These extensions pose a security risk to your system.</p>"
        );

        foreach (var userExtension in userGroup)
        {
          emailBody.AppendLine(
            $"<li>Extension: <strong>{userExtension.Extension.name}</strong></li>"
          );
        }

        emailBody.AppendLine(
          "<p style=\"font-weight: bold; color: #D80032;\">Action Required:</p>"
        );
        emailBody.AppendLine(
          "<p style=\"color: #D80032;\">Please uninstall the mentioned extensions immediately to ensure the security of your system.</p>"
        );
        emailBody.AppendLine("</div>");

        emailBody.AppendLine("<p>Regards,</p>");
        emailBody.AppendLine("<p>System Admin Team</p>");
        emailBody.AppendLine("</body></html>");

        // Send email to the user
        await _emailService.SendRejectionEmailAsync(userEmail, emailBody.ToString());
      }
    }
    return "Extension Email Process Completed";
  }

  private async Task<string> DoSoftwareAsync()
  {
    var scope = _service.CreateScope();

    AppDbContext _context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    EmailService _emailService = scope.ServiceProvider.GetRequiredService<EmailService>();

    _logger.Information("Executing Software Method");

    DateTime currentDateTime = DateTime.UtcNow;

    // Get all users who have rejected extensions and whose modifieddatetime is equal to the current datetime
    var usersWithRejectedSoftwares = _context
      .UserSoftwares.Include(u => u.Software)
      .Where(u =>
        u.Software.Status == AcceptanceStatus.rejected
        && u.ModifiedDateTime >= currentDateTime.AddMinutes(-1)
      )
      .ToList();
    _logger.Information("RejectionSoftwaews" + usersWithRejectedSoftwares);

    var SoftwaresByUser = usersWithRejectedSoftwares.GroupBy(u => u.UserName).ToList();

    foreach (var userGroup in SoftwaresByUser)
    {
      var userEmail = _context
        .UserDatas.Where(u => u.LocalADUserName == userGroup.Key)
        .Select(u => u.Email)
        .FirstOrDefault();

      if (!string.IsNullOrEmpty(userEmail))
      {
        StringBuilder emailBody = new StringBuilder();
        emailBody.AppendLine($"<html><body>");
        emailBody.AppendLine($"<p>Dear {userGroup.Key},</p>");
        emailBody.AppendLine("<div style=\"   padding: 1rem;\">");
        emailBody.AppendLine(
          "<p style=\"font-weight: bold; color: #D80032;\">Emergency Notification:</p>"
        );
        emailBody.AppendLine(
          "<p>We have identified issues with the extensions associated with your account in our system. These extensions pose a security risk to your system.</p>"
        );

        foreach (var userSoftware in userGroup)
        {
          emailBody.AppendLine($"<li>Software: <strong>{userSoftware.Software.Name}</strong></li>");
        }

        emailBody.AppendLine(
          "<p style=\"font-weight: bold; color: #D80032;\">Action Required:</p>"
        );
        emailBody.AppendLine(
          "<p style=\"color: #D80032;\">Please uninstall the mentioned extensions immediately to ensure the security of your system.</p>"
        );
        emailBody.AppendLine("</div>");

        emailBody.AppendLine("<p>Regards,</p>");
        emailBody.AppendLine("<p>System Admin Team</p>");
        emailBody.AppendLine("</body></html>");

        // Send email to the user
        await _emailService.SendRejectionEmailAsync(userEmail, emailBody.ToString());
      }
    }
    return "Software Email Process Completed";
  }
}
