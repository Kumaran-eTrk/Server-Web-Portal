namespace eTrkServer.DTO.RequestDTO
{
  public class SoftwarePostDto
  {
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string Name { get; set; }

    public string Version { get; set; }

    public AcceptanceStatus Status { get; set; }
  }

  public class SoftwareStatusUpdateDto
  {
    public AcceptanceStatus Status { get; set; }
    public string Remarks { get; set; }
  }
}
