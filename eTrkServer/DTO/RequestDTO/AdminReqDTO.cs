namespace eTrkServer.DTO.RequestDTO
{
  public class AverageHours
  {
    public List<string> email { get; set; }
    public DateTime? fromDate { get; set; }
    public DateTime? toDate { get; set; }
  }

  public class FilterDataRequest
  {
    public string? Location { get; set; }
    public string? Division { get; set; }
    public string? Project { get; set; }
  }

  public class LoginStatus
  {
    public string? time { get; set; }
    public DateTime? fromDate { get; set; }
    public DateTime? toDate { get; set; }
  }

  public class AgentToken
  {
    public string? productkey { get; set; }
    public string? role { get; set; }
  }

  public class UserComparison
  {
    public DateTime fromDate { get; set; }
    public DateTime toDate { get; set; }

    public List<string> email { get; set; }
  }

  public class UserRecording
  {
    public string email { get; set; }

    public DateTime fromDate { get; set; }

    public DateTime toDate { get; set; }
  }

  public class WorkingPattern
  {
    public DateTime? fromDate { get; set; }
    public DateTime? toDate { get; set; }
  }

  public class ScreenshotConfiguration
  {
    public string UserName { get; set; }
    public string DomainName { get; set; }
  }

  public class HolidayWorkSummaryRequest
  {
    public DateTime fromDate { get; set; }
    public DateTime toDate { get; set; }
    public string? location { get; set; }
    public List<string> email { get; set; }
  }
}
