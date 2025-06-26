using System.Net;
using System.Net.Mail;

public class EmailService
{
  private readonly IConfiguration _configuration;
  private readonly Serilog.ILogger _logger;

  public EmailService(IConfiguration configuration, Serilog.ILogger logger)
  {
    _configuration = configuration;
    _logger = logger;
  }

  public async Task SendRejectionEmailAsync(string userEmail, string extensionName)
  {
    string mailAddress = _configuration.GetValue<string>("Mail:MailAddress");
    string password = _configuration.GetValue<string>("Mail:Password");
    string hostName = _configuration.GetValue<string>("Mail:HostName");
    int port = _configuration.GetValue<int>("Mail:Port");

    try
    {
      var client = new SmtpClient(hostName, port)
      {
        EnableSsl = true,
        UseDefaultCredentials = false, // Ensure this is set to false
        Credentials = new NetworkCredential(mailAddress, password)
      };

      string subject = "Your request has been rejected";
      // string body = $"Dear {userName},\n\nYour request for the extension '{extensionName}' has been rejected.Please Uninstall the Respective Extensions\n\nRegards,\nYour Application <button style="+"'background-color':'red'"+"> Danger </button>";

      var mailMessage = new MailMessage(from: mailAddress, to: userEmail, subject, extensionName);
      mailMessage.IsBodyHtml = true;

      await client.SendMailAsync(mailMessage);

      _logger.Information("Email Sent successfully");
    }
    catch (Exception ex)
    {
      _logger.Debug($"Error sending email: {ex.Message}");
    }
  }

  public async Task SendEmailAsync(string targetEmail, string subject, string emailbody)
  {
    string mailAddress = _configuration.GetValue<string>("Mail:MailAddress");
    string password = _configuration.GetValue<string>("Mail:Password");
    string hostName = _configuration.GetValue<string>("Mail:HostName");
    int port = _configuration.GetValue<int>("Mail:Port");

    try
    {
      var client = new SmtpClient(hostName, port)
      {
        EnableSsl = true,
        UseDefaultCredentials = false, // Ensure this is set to false
        Credentials = new NetworkCredential(mailAddress, password)
      };

      _logger.Information("Target Email : " + targetEmail);
      var mailMessage = new MailMessage(from: mailAddress, to: targetEmail, subject, emailbody);
      mailMessage.IsBodyHtml = true;

      await client.SendMailAsync(mailMessage);

      _logger.Information("Email Sent successfully");
    }
    catch (Exception ex)
    {
      _logger.Debug($"Error sending email: {ex.Message}");
    }
  }

  public async Task SendEmailAverage(
    string targetEmail,
    string Cc,
    string subject,
    string emailbody
  )
  {
    string mailAddress = _configuration.GetValue<string>("Mail:MailAddress");
    string password = _configuration.GetValue<string>("Mail:Password");
    string hostName = _configuration.GetValue<string>("Mail:HostName");
    var ccMailAddresses = _configuration.GetValue<string>("CC:MailAddresses");
    int port = _configuration.GetValue<int>("Mail:Port");

    try
    {
      var client = new SmtpClient(hostName, port)
      {
        EnableSsl = true,
        UseDefaultCredentials = false, // Ensure this is set to false
        Credentials = new NetworkCredential(mailAddress, password)
      };

      var mailMessage = new MailMessage(from: mailAddress, to: targetEmail);
      mailMessage.IsBodyHtml = true;
      mailMessage.Subject = subject;
      mailMessage.Body = emailbody;

      List<string> allCcAddresses = new List<string>();

      _logger.Information("config Addresses: " + ccMailAddresses);
      _logger.Information("cc Addresses: " + Cc);

      if (!string.IsNullOrEmpty(Cc))
      {
        var paramCcAddresses = Cc.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
        allCcAddresses.AddRange(paramCcAddresses);
      }
      if (!string.IsNullOrEmpty(ccMailAddresses))
      {
        var CcAddresses = ccMailAddresses.Split(
          new[] { ',' },
          StringSplitOptions.RemoveEmptyEntries
        );
        allCcAddresses.AddRange(CcAddresses);
      }

      // Add the unique CC addresses to the MailMessage
      foreach (var ccEmail in allCcAddresses.Distinct())
      {
        _logger.Information("All CC Addresses: " + ccEmail);
        mailMessage.CC.Add(ccEmail);
      }

      await client.SendMailAsync(mailMessage);
      Task.Delay(2);

      _logger.Information("Email Sent successfully for Average Hours");
    }
    catch (Exception ex)
    {
      _logger.Debug($"Error sending email: {ex.Message}");
      _logger.Error($"Error sending email: {ex.InnerException}");
      _logger.Error($"Error sending email: {ex.StackTrace}");
    }
  }
}
