namespace eTrkServer.DTO.ResponseDTO
{
  public class GetSoftwares
  {
    public string Id { get; set; }

    public string Name { get; set; }

    public string Version { get; set; }
  }

  public class RejectedSoftwareDto
  {
    public string SoftwareName { get; set; }
    public string Version { get; set; }
    public string Status { get; set; }
    public List<UserSoftwareDto> Users { get; set; }
  }

  public class UserSoftwareDto
  {
    public string Username { get; set; }
    public string StartDateTime { get; set; }
    public DateTime ModifiedDateTime { get; set; }
  }
}
