namespace eTrkServer.DTO.RequestDTO
{
  public class ApplicationUpdate
  {
    public string ApplicationName { get; set; }
    public string AlternativeName { get; set; }
  }

  public class ApplicationUpdateRequest
  {
    public string ApplicationName { get; set; }
    public List<string> Projects { get; set; }
    public bool Productive { get; set; }
  }

  public class ProjectMapping
  {
    public string ProjectId { get; set; }

    public string ProjectName { get; set; }

    public List<ApplicationInfo> Applications { get; set; }

    public string ModifiedBy { get; set; }
    public DateTime ModifiedDatetime { get; set; }
  }

  public class Projectupdate
  {
    public string ProjectId { get; set; }

    public bool Productive { get; set; }
    public List<string> Applications { get; set; }
  }

  public class ApplicationInfo
  {
    public string ApplicationId { get; set; }
    public string ApplicationName { get; set; }

    public string AlternativeName { get; set; }

    public bool Productive { get; set; }

    public string ModifiedBy { get; set; }
    public DateTime ModifiedDatetime { get; set; }
  }

  public class UpdateProjectApplicationsRequest
  {
    public string projectId { get; set; }
    public string applicationId { get; set; }
    public bool newProductivity { get; set; }
  }

  public class ProjectMappingDto
  {
    public List<string> ProjectId { get; set; }
    public List<string> ApplicationIds { get; set; }
    public bool Productive { get; set; }
  }

  public class AppVersion
  {
    public string? Version { get; set; }
    public string? UserName { get; set; }
    public string? DomainName { get; set; }
  }
}
