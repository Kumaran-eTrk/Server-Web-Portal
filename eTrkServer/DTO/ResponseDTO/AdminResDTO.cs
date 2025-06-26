namespace eTrkServer.DTO.ResponseDTO
{
  public class AverageHoursDTO
  {
    public string User { get; set; }
    public string JobTitle { get; set; }
    public string Team { get; set; }
    public string AverageHours { get; set; }
  }

  public class FilterResponse
  {
    public List<string> Locations { get; set; }
    public List<string> Divisions { get; set; }
    public List<string> Projects { get; set; }
    public List<UserDetails> Users { get; set; }
  }

  public class AgentStatus
  {
    public string DisplayName { get; set; }
    public string Project { get; set; }
    public string OverallStatus { get; set; }
    public List<DomainStatus> Domains { get; set; }
  }

  public class DomainStatus
  {
    public string Domain { get; set; }
    public string Status { get; set; }
    public string LastCurrentDateTime { get; set; }
  }

  public class VideoResponse
  {
    public string message { get; set; }
    public string video_base64 { get; set; }
  }

  public class UserDetails
  {
    public string UserId { get; set; }
    public string Email { get; set; }
    public string UserName { get; set; }
    public string DomainName { get; set; }

    public string JobTitle { get; set; }
    public string DisplayName { get; set; }
  }

  public class projectkeyresponse
  {
    public string Id { get; set; }
    public string productkey { get; set; }

    public string description { get; set; }
  }

  public class UserComparisionDTO
  {
    public string User { get; set; }

    public string LoggedHours { get; set; }
    public string IdleHours { get; set; }
    public string WorkingHours { get; set; }
    public string ProductiveMinutes { get; set; }
    public string NonProductiveMinutes { get; set; }
  }

  public class WorkSummary
  {
    public string User { get; set; }
    public string JobTitle { get; set; }
    public string Date { get; set; }
    public string LoggedHours { get; set; }
    public string IdleHours { get; set; }
    public string WorkingHours { get; set; }
    public string ProductiveMinutes { get; set; }
    public string NonProductiveMinutes { get; set; }
  }

  public class TotalHoursSummary
  {
    public string ProductiveHours { get; set; }
    public string NonProductiveHours { get; set; }
    public string LoggedHours { get; set; }
    public string WorkingHours { get; set; }
    public string IdleHours { get; set; }
  }

  public class HolidayWorkSummary
  {
    public string Date { get; set; }
    public string Day { get; set; }
    public string Name { get; set; }

    public string ProductiveHours { get; set; }
    public string NonProductiveHours { get; set; }
    public string LoggedHours { get; set; }
    public string WorkingHours { get; set; }

    public string IdleHours { get; set; }
  }

  public class LoginStatusDTO
  {
    public DateTime Date { get; set; }
    public string UserName { get; set; }
    public string Team { get; set; }
    public string JobTitle { get; set; }
    public bool Status { get; set; }
    public string ShiftTime { get; set; }
  }

  public class WorkingPatternDTO
  {
    public string Date { get; set; }
    public string Username { get; set; }
    public string LoggedInTime { get; set; }
    public string LoggedOutTime { get; set; }
  }

  public class ScreenshotConfigurationDTO
  {
    public string Username { get; set; }
    public string Domainname { get; set; }
    public bool Screenshot { get; set; }
  }
}
