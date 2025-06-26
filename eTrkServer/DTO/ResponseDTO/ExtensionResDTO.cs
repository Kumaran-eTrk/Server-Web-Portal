namespace eTrkServer.DTO.ResponseDTO
{
  public class GetExtensions
  {
    public string Id { get; set; }

    public string Name { get; set; }

    public string Version { get; set; }
    public string Browser { get; set; }
    public string Permissions { get; set; }
  }

  public class RejectedExtensionDto
  {
    public string ExtensionName { get; set; }
    public string Version { get; set; }
    public string Status { get; set; }
    public List<UserDto> Users { get; set; }
  }

  public class UserDto
  {
    public string Username { get; set; }
    public string Permissions { get; set; }
    public string Browser { get; set; }
    public DateTime StartDateTime { get; set; }
    public DateTime ModifiedDateTime { get; set; }
  }
}
