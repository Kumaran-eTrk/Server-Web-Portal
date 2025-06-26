using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using eTrkServer.DTO.RequestDTO;

namespace eTrkServer.Entity
{
  public class ProductInfo
  {
    public string? Id { get; set; } = Guid.NewGuid().ToString();

    public string? Productkey { get; set; }

    public byte[]? Salt { get; set; }

    public string? Description { get; set; }
  }

  public class ProjectMaster
  {
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string ProjectName { get; set; }

    public string? ModifiedBy { get; set; }
    public DateTime? ModifiedDatetime { get; set; }
  }

  public class ApplicationMaster
  {
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string ApplicationName { get; set; }
    public string AlternativeName { get; set; }

    public string? ModifiedBy { get; set; }
    public DateTime? ModifiedDatetime { get; set; }
  }

  public class ProjectApplications
  {
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string ApplicationId { get; set; }
    public ApplicationMaster App { get; set; }
    public string ProjectId { get; set; }
    public ProjectMaster Project { get; set; }
    public bool Productive { get; set; }

    public string? ModifiedBy { get; set; }
    public DateTime ModifiedDatetime { get; set; }
  }

  public class IPAddressInfo
  {
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string UserName { get; set; }
    public string IPAddress { get; set; }
    public string MacAddress { get; set; }
    public DateTime RecordDateTime { get; set; }
    public string? City { get; set; } // Optional, based on whether you want to store city
    public string? State { get; set; } // Optional
    public string? Country { get; set; } // Optional
  }

  public class ApplicationUsage
  {
    public string Id { get; set; }

    /// <summary>
    ///  = Guid.NewGuid().ToString();
    /// </summary>
    public string? Application { get; set; }

    public string? ApplicationName { get; set; }
    public DateTime? StartDateTime { get; set; }
    public DateTime? EndDateTime { get; set; }
    public TimeSpan? Duration =>
      (TimeSpan)(EndDateTime.HasValue ? (EndDateTime.Value - StartDateTime) : TimeSpan.Zero);
    public byte[]? Screenshot { get; set; }

    public string? ScreenshotPath { get; set; }

    public DateTime? RecordDateTime { get; set; }

    [ForeignKey("UserActivityUserName,UserActivityDomainName,UserActivityCurrentDateTime")]
    public string UserActivityUserName { get; set; }
    public string UserActivityDomainName { get; set; }
    public DateTime UserActivityCurrentDateTime { get; set; }

    public virtual UserActivity? UserActivity { get; set; }
  }

  public class BrowserHistory
  {
    public string? Id { get; set; } = Guid.NewGuid().ToString();
    public string? URL { get; set; }
    public string? Title { get; set; } // Title of the web page
    public DateTime? VisitTime { get; set; }
    public string? BrowserName { get; set; } // E.g., Chrome, Firefox, etc.

    [ForeignKey("UserActivityUserName,UserActivityDomainName,UserActivityCurrentDateTime")]
    public string? UserActivityUserName { get; set; }
    public string? UserActivityDomainName { get; set; }
    public DateTime? UserActivityCurrentDateTime { get; set; }

    public virtual UserActivity? UserActivity { get; set; }
  }

  public class UserMetadata
  {
    [Key]
    public required string UserName { get; set; }
    public required string DomainName { get; set; }
    public required string MachineName { get; set; } // Name of the computer
    public required string OSVersion { get; set; } // OS version e.g. "Windows 10"
    public required string OSType { get; set; } // OS type e.g. "64-bit"
    public string? MachineType { get; set; } // e.g. "Desktop", "Laptop", "Tablet"
    public DateTime RecordDateTime { get; set; }
  }

  public class UserActivity
  {
    [Key]
    public string? UserName { get; set; }

    [Key]
    public string? DomainName { get; set; }

    [Key]
    public DateTime CurrentDateTime { get; set; }
    public bool? IsSessionLocked { get; set; }
    public long TotalIdleTime { get; set; }

    public virtual ICollection<ApplicationUsage>? ActiveApplications { get; set; } =
      new List<ApplicationUsage>();
    public virtual ICollection<BrowserHistory>? BrowserHistory { get; set; } =
      new List<BrowserHistory>();
  }

  public class UserLoggingActivity
  {
    public string? Id { get; set; } = Guid.NewGuid().ToString();
    public string? UserName { get; set; }
    public string? DomainName { get; set; }
    public DateTime? CurrentDateTime { get; set; }
    public DateTime? LastLogonDateTime { get; set; }
    public DateTime? LastLogoutDateTime { get; set; }
  }

  public class UserData
  {
    public string? Id { get; set; } = Guid.NewGuid().ToString();

    public string Email { get; set; }

    public string DisplayName { get; set; }

    public string ReportingInto { get; set; }

    public string Division { get; set; }

    public string Location { get; set; }

    public string JobTitle { get; set; }

    public string? ReportingIntoMail { get; set; }

    public string Branch { get; set; }

    [ForeignKey("ProjectId")]
    public string ProjectId { get; set; }

    public ProjectMaster Project { get; set; }

    public string LocalADDomain { get; set; }

    public string LocalADUserName { get; set; }

    public string? Password { get; set; } = null;

    public string? ModifiedBy { get; set; }
    public DateTime? ModifiedDatetime { get; set; }

    [DefaultValue(false)] // Set default value for isDelete
    public bool isDelete { get; set; } = false;

    public string VersionId { get; set; } = "1.0";

    public string? ShiftStartTime { get; set; }

    public string? ShiftEndTime { get; set; }
    public bool IsScreenshot { get; set; } = false;
  }

  public class RoleMaster
  {
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int role_id { get; set; }
    public string rolename { get; set; }
    public string description { get; set; }

    public string? ModifiedBy { get; set; }
    public DateTime? ModifiedDatetime { get; set; }
  }

  public class UsersRoles
  {
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public string useremail { get; set; }

    [ForeignKey("Role")]
    public int RoleId { get; set; }

    public RoleMaster Role { get; set; }

    public string? ModifiedBy { get; set; }
    public DateTime? ModifiedDatetime { get; set; }
  }

  public class Holidays
  {
    public string? Id { get; set; } = Guid.NewGuid().ToString();
    public string Holiday { get; set; }
    public DateTime Date { get; set; }
    public string Location { get; set; }
    public string Branch { get; set; }
    public string? ModifiedBy { get; set; }
    public DateTime? ModifiedTime { get; set; }
  }

  public class Extension
  {
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string name { get; set; }

    public string version { get; set; }

    public AcceptanceStatus Status { get; set; }

    // Navigation property for one-to-many relationship
    public ICollection<UserExtension> UserExtensions { get; set; }
  }

  // Define UserExtension entity
  public class UserExtension
  {
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [ForeignKey("Extension")]
    public string ExtensionID { get; set; }

    public string username { get; set; }

    public string permissions { get; set; }

    public string browser { get; set; }

    public DateTime startdatetime { get; set; }

    public DateTime modifieddatetime { get; set; }

    // Navigation property for one-to-many relationship
    public Extension Extension { get; set; }
  }

  // Define History entity
  public class History
  {
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [ForeignKey("Extension")]
    public string ExtensionID { get; set; }

    public string updateversion { get; set; }
    public string remarks { get; set; }

    public string modifiedbyuser { get; set; }

    public DateTime modifieddatetime { get; set; }

    // Navigation property
    public Extension Extension { get; set; }
  }

  // Software Extensions
  public class Software
  {
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string Name { get; set; }

    public string Version { get; set; }

    public AcceptanceStatus Status { get; set; }

    // Navigation property for one-to-many relationship
    public ICollection<UserSoftwares> UserSoftwares { get; set; }
  }

  public class UserSoftwares
  {
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [ForeignKey("Software")]
    public string SoftwareID { get; set; }

    public string UserName { get; set; }

    public string InstalledDate { get; set; }

    public DateTime ModifiedDateTime { get; set; }

    // Navigation property for one-to-many relationship
    public Software Software { get; set; }
  }

  public class SoftwareHistory
  {
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [ForeignKey("Software")]
    public string SoftwareID { get; set; }

    public string EditVersion { get; set; }
    public string Remarks { get; set; }

    public string ModifiedByUser { get; set; }

    public DateTime ModifiedDateTime { get; set; }

    // Navigation property
    public Software Software { get; set; }
  }

  public class Softwareinfo
  {
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; }

    public string Version { get; set; }
    public string UserName { get; set; }

    public DateTime ModifiedDateTime { get; set; }

    public string InstalledDate { get; set; }

    public AcceptanceStatus Status { get; set; }

    public Softwareinfo()
    {
      Status = AcceptanceStatus.unknown;
    }
  }
}
