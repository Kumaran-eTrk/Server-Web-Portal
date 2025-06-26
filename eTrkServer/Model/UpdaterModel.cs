using System.ComponentModel.DataAnnotations;

namespace eTrkServer.Model
{
  public class UpdaterModel
  {
    [Key]
    public string? VersionId { get; set; }
    public string? Description { get; set; }
    public string? Path { get; set; }
    public DateTime FromDate { get; set; }
  }
}
