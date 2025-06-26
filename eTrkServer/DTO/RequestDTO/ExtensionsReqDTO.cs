namespace eTrkServer.DTO.RequestDTO
{
  public enum AcceptanceStatus
  {
    unknown, // Default state, assuming no specific status is set
    accepted,
    rejected
  }

  public class ExtensionPost
  {
    public string name { get; set; }
    public string version { get; set; }
    public int status { get; set; } // This maps to AcceptanceStatus enum
  }

  public class ExtensionsStatusUpdateModel
  {
    public bool? Approval { get; set; }

    // public string ModifiedBy { get; set; }
    public string Remarks { get; set; }
  }

  public class ExtensionStatusUpdateDto
  {
    public AcceptanceStatus Status { get; set; }
    public string Remarks { get; set; }
  }

  public class ExtensionDTo
  {
    public string? Id { get; set; } = Guid.NewGuid().ToString();
    public string name { get; set; }
    public string description { get; set; }
    public string version { get; set; }

    public List<string> permissions { get; set; }

    public string browser { get; set; }

    public string username { get; set; }

    public AcceptanceStatus Status { get; set; }
    public DateTime startdatetime { get; set; }
    public DateTime modifieddatetime { get; set; }

    public ExtensionDTo()
    {
      modifieddatetime = DateTime.UtcNow;
      Status = AcceptanceStatus.unknown;
    }
  }
}
