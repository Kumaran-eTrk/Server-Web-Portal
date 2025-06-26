namespace eTrkServer.DTO.RequestDTO
{
  public class WorkSummaryRequest
  {
    public DateTime fromDate { get; set; }
    public DateTime toDate { get; set; }
    public string? location { get; set; }
    public List<string> email { get; set; }
  }

  public class ApplicationUsageRequest
  {
    public DateTime fromDate { get; set; }
    public DateTime toDate { get; set; }
    public string type { get; set; }
    public string? location { get; set; }
    public List<string> email { get; set; }
  }

  public class IPAddressRequest
  {
    public DateTime fromDate { get; set; }
    public DateTime toDate { get; set; }
    public string? location { get; set; }
    public List<string> email { get; set; }
  }
}
