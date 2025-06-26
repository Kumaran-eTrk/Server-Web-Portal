namespace eTrkServer.DTO.ResponseDTO
{
  public class WorkSummaryGraphDTO
  {
    public string Date { get; set; }
    public string LoggedHours { get; set; }
    public string IdleHours { get; set; }
    public string WorkingHours { get; set; }
    public string ProductiveHours { get; set; }
    public string NonProductiveHours { get; set; }
  }

  public class ApplicationUsageResponse
  {
    public string Application { get; set; }
    public string ActiveMinutes { get; set; }
    public bool Productive { get; set; }
  }

  public class IpAddressResponse
  {
    public string ipAddress { get; set; }
    public string Username { get; set; }

    public string DisplayName { get; set; }
    public string RecordDateTime { get; set; }
  }
}
