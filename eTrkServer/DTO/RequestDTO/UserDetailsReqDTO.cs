namespace eTrkServer.DTO.RequestDTO
{
  public class UserDatasPost
  {
    public string? Id { get; set; } = Guid.NewGuid().ToString();

    public string Email { get; set; }

    public string DisplayName { get; set; }

    public string? ReportingInto { get; set; }

    public string Division { get; set; }

    public string Location { get; set; }

    public string JobTitle { get; set; }

    public string? ReportingIntoMail { get; set; }

    public string Branch { get; set; }
    public string ProjectId { get; set; }

    public string LocalADDomain { get; set; }

    public string LocalADUserName { get; set; }

    public string? Password { get; set; } = null;

    public string? ModifiedBy { get; set; }
    public DateTime? ModifiedDatetime { get; set; }
    public string ShiftEndTime { get; set; }

    public string ShiftStartTime { get; set; }
    public bool IsScreenshot { get; set; }
  }

  public class ProjectUpdate
  {
    public string ProjectName { get; set; }
  }

  public class UsersDetailsUpdate
  {
    public string Email { get; set; }

    public string DisplayName { get; set; }

    public string ReportingInto { get; set; }

    public string Division { get; set; }

    public string Location { get; set; }

    public string JobTitle { get; set; }

    public string ReportingIntoMail { get; set; }

    public string Branch { get; set; }
    public string ProjectId { get; set; }

    public string LocalADDomain { get; set; }

    public string LocalADUserName { get; set; }

    public string? ModifiedBy { get; set; }
    public DateTime? ModifiedDatetime { get; set; }

    public string ShiftEndTime { get; set; }

    public string ShiftStartTime { get; set; }

    public bool IsScreenshot { get; set; }
  }

  public class UserDataDto
  {
    public string Id { get; set; }
    public string Email { get; set; }
    public string DisplayName { get; set; }
    public string ReportingInto { get; set; }
    public string Division { get; set; }
    public string Location { get; set; }
    public string JobTitle { get; set; }
    public string ReportingIntoMail { get; set; }
    public string Branch { get; set; }
    public string ProjectId { get; set; } // Assuming ProjectId can be nullable
    public string LocalADDomain { get; set; }
    public string LocalADUserName { get; set; }
    public string ModifiedBy { get; set; }
    public DateTime? ModifiedDatetime { get; set; } // Assuming ModifiedDatetime can be nullable
    public string ProjectName { get; set; }
    public string ShiftStartTime { get; set; } // Assuming ShiftStartTime can be nullable
    public string ShiftEndTime { get; set; } // Assuming ShiftEndTime can be nullable
    public bool IsScreenshot { get; set; }
  }

  public class UserRoleDetailsRequest
  {
    public string Email { get; set; }
    public List<int> RoleIds { get; set; }
  }

  public class UserRoleUpdateRequest
  {
    public List<int> RoleIds { get; set; }
  }

  public class RoleUpdateRequest
  {
    public string rolename { get; set; }
    public string description { get; set; }
  }

  public class GetRole
  {
    public int roleId { get; set; }
    public string roleName { get; set; }
  }

  public class UserRoleDto
  {
    public int Id { get; set; }
    public string displayname { get; set; }
    public string useremail { get; set; }
    public int RoleId { get; set; }
    public string Rolename { get; set; }
    public string? ModifiedBy { get; set; }
    public DateTime? ModifiedDatetime { get; set; }
  }
}
