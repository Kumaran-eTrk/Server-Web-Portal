using eTrkServer.DTO.RequestDTO;
using eTrkServer.Entity;
using eTrkServer.Helpers;
using eTrkServer.Interface;
using eTrkServer.Utils;
using Microsoft.EntityFrameworkCore;

namespace eTrkServer.ServiceImplementation
{
  public class UserService : IUserService
  {
    private readonly AppDbContext _context;
    private readonly Serilog.ILogger _logger;
    private readonly IConfiguration _configuration;

    private readonly HashPassword password;

    public UserService(AppDbContext context, Serilog.ILogger logger, IConfiguration configuration)
    {
      _context = context;
      _logger = logger;
      _configuration = configuration;
      password = new HashPassword();
    }

    public async Task<BaseResponse<string>> CreateUser(string username, UserDatasPost request)
    {
      BaseResponse<string> response = new BaseResponse<string>();
      try
      {
        if (request == null)
        {
          response.Message = "Request not found";
          response.Success = false;
          return response;
        }

        if (string.IsNullOrEmpty(username))
        {
          response.Message = "username claims not found";
          response.Success = false;
          return response;
        }

        var existingUser = _context.UserDatas.FirstOrDefault(u =>
          u.LocalADUserName == request.LocalADUserName
          && u.LocalADDomain == request.LocalADDomain
          && u.isDelete == false
        );

        if (existingUser != null)
        {
          // User with the same username already exists, return conflict
          _logger.Information($"User with username '{request.LocalADUserName}' already exists");
          response.Message = "User with username already exists : " + request.LocalADUserName;
          response.Success = false;
          return response;
        }

        request.Id = Guid.NewGuid().ToString();
        request.ModifiedDatetime = DateTime.UtcNow;
        request.ModifiedBy = username;

        string pass = _configuration["DefaultPassword:Password"];
        // Hash the password
        request.Password = password.Password(pass);

        var newUser = new UserData
        {
          Id = request.Id,
          Email = request.Email,
          DisplayName = request.DisplayName,
          ReportingInto = request.ReportingInto,
          Division = request.Division,
          Location = request.Location,
          JobTitle = request.JobTitle,
          ReportingIntoMail = request.ReportingIntoMail,
          Branch = request.Branch,
          ProjectId = request.ProjectId,
          LocalADDomain = request.LocalADDomain,
          LocalADUserName = request.LocalADUserName,
          Password = request.Password,
          ModifiedBy = request.ModifiedBy,
          ModifiedDatetime = request.ModifiedDatetime,
          ShiftStartTime = request.ShiftStartTime,
          ShiftEndTime = request.ShiftEndTime,
          IsScreenshot = request.IsScreenshot,
        };

        _context.UserDatas.Add(newUser);
        await _context.SaveChangesAsync();

        _logger.Information("User created successfully");
        response.Message = "User Created Successfully";
        response.Success = true;
        return response;
      }
      catch (Exception ex)
      {
        _logger.Debug("Error on creating user: " + ex.StackTrace);
        response.Message = ex.Message.ToString();
        response.Success = false;
        return response;
      }
    }

    public Task<BaseResponse<string>> DeleteUser(string Id)
    {
      BaseResponse<string> response = new BaseResponse<string>();
      try
      {
        // Retrieve user details by ID
        var userDetails = _context.UserDatas.FirstOrDefault(u => u.Id == Id);

        // Check if user details exist
        if (userDetails == null)
        {
          response.Message = "User Details not found";
          response.Success = false;
          return Task.FromResult(response);
        }

        // Soft delete the user by setting isDelete flag to true
        userDetails.isDelete = true;

        // Update the user details in the database
        _context.UserDatas.Update(userDetails);
        _context.SaveChanges();

        response.Message = "User details  deleted successfully";
        response.Success = true;
        return Task.FromResult(response);
      }
      catch (Exception ex)
      {
        _logger.Debug("Error soft deleting user details: " + ex.StackTrace);
        response.Message = ex.Message.ToString();
        response.Success = false;
        return Task.FromResult(response);
      }
    }

    public Task<BaseResponse<List<UserDataDto>>> GetUser()
    {
      BaseResponse<List<UserDataDto>> response = new BaseResponse<List<UserDataDto>>();
      try
      {
        // Retrieve active users where isDelete is false
        var activeUsers = _context
          .UserDatas.Include(u => u.Project) // Eager loading the Project entity
          .Where(u => u.isDelete == false)
          .Select(u => new UserDataDto
          {
            Id = u.Id,
            Email = u.Email,
            DisplayName = u.DisplayName,
            ReportingInto = u.ReportingInto,
            Division = u.Division,
            Location = u.Location,
            JobTitle = u.JobTitle,
            ReportingIntoMail = u.ReportingIntoMail,
            Branch = u.Branch,
            ProjectId = u.ProjectId,
            LocalADDomain = u.LocalADDomain,
            LocalADUserName = u.LocalADUserName,
            ModifiedBy = u.ModifiedBy,
            ModifiedDatetime = u.ModifiedDatetime,
            ProjectName = u.Project.ProjectName, // Include project name from related Project entity
            ShiftStartTime = u.ShiftStartTime,
            ShiftEndTime = u.ShiftEndTime,
            IsScreenshot = u.IsScreenshot,
          })
          .ToList();
        response.Message = "UserData Retreived Successfully";
        response.Success = true;
        response.Data = activeUsers;
        return Task.FromResult(response);
      }
      catch (Exception ex)
      {
        // Handle any errors that occur during the query
        response.Message = ex.Message.ToString();
        response.Success = false;
        response.Data = null;
        return Task.FromResult(response);
      }
    }

    public async Task<BaseResponse<string>> UpdateUser(
      string Id,
      string username,
      UsersDetailsUpdate request
    )
    {
      BaseResponse<string> response = new BaseResponse<string>();

      try
      {
        if (request == null)
        {
          response.Message = "Invalid request data";
          response.Success = false;
          return response;
        }

        if (string.IsNullOrEmpty(username))
        {
          response.Message = "username claim not found";
          response.Success = false;
          return response;
        }

        // Find the user by ID
        var userToUpdate = await _context.UserDatas.FindAsync(Id);
        if (userToUpdate == null)
        {
          response.Message = "User not found";
          response.Success = false;
          return response;
        }

        // Find all user roles associated with the old email
        var userRolesToUpdate = _context
          .UsersRoles.Where(ur => ur.useremail == userToUpdate.Email)
          .ToList();

        // Update user properties
        userToUpdate.Email = request.Email;
        userToUpdate.DisplayName = request.DisplayName;
        userToUpdate.ReportingInto = request.ReportingInto;
        userToUpdate.Division = request.Division;
        userToUpdate.Location = request.Location;
        userToUpdate.JobTitle = request.JobTitle;
        userToUpdate.ReportingIntoMail = request.ReportingIntoMail;
        userToUpdate.Branch = request.Branch;
        userToUpdate.ProjectId = request.ProjectId;
        userToUpdate.LocalADUserName = request.LocalADUserName;
        userToUpdate.LocalADDomain = request.LocalADDomain;
        userToUpdate.ModifiedBy = username;
        userToUpdate.ModifiedDatetime = DateTime.UtcNow;
        userToUpdate.ShiftStartTime = request.ShiftStartTime;
        userToUpdate.ShiftEndTime = request.ShiftEndTime;
        userToUpdate.IsScreenshot = request.IsScreenshot;

        // Update other columns based on the email ID
        var otherUserToUpdate = await _context.UserDatas.FirstOrDefaultAsync(u =>
          u.Email == userToUpdate.Email && u.Id != userToUpdate.Id
        );
        if (otherUserToUpdate != null)
        {
          // Update other properties
          otherUserToUpdate.DisplayName = request.DisplayName;
          otherUserToUpdate.ReportingInto = request.ReportingInto;
          otherUserToUpdate.ReportingIntoMail = request.ReportingIntoMail;
          otherUserToUpdate.Division = request.Division;
          otherUserToUpdate.Location = request.Location;
          otherUserToUpdate.JobTitle = request.JobTitle;
          otherUserToUpdate.Branch = request.Branch;
          otherUserToUpdate.ProjectId = request.ProjectId;
          otherUserToUpdate.ModifiedBy = username;
          otherUserToUpdate.ModifiedDatetime = DateTime.UtcNow;
          otherUserToUpdate.ShiftStartTime = request.ShiftStartTime;
          otherUserToUpdate.ShiftEndTime = request.ShiftEndTime;
          otherUserToUpdate.IsScreenshot = request.IsScreenshot;
        }

        foreach (var userRole in userRolesToUpdate)
        {
          userRole.useremail = request.Email;

          userRole.ModifiedBy = username;
          userRole.ModifiedDatetime = DateTime.UtcNow;
        }

        // Update the user in the database
        _context.UserDatas.Update(userToUpdate);
        // Update the user in the database
        _context.UserDatas.Update(userToUpdate);
        if (otherUserToUpdate != null)
        {
          _context.UserDatas.Update(otherUserToUpdate);
        }

        await _context.SaveChangesAsync();

        response.Message = "User updated successfully";
        response.Success = true;
        return response;
      }
      catch (Exception ex)
      {
        response.Message = ex.Message.ToString();
        response.Success = false;
        return response;
      }
    }

    public Task<BaseResponse<string>> CreateRole(string username, RoleMaster request)
    {
      BaseResponse<string> response = new BaseResponse<string>();
      try
      {
        if (request == null)
        {
          response.Success = false;
          response.Message = "Invalid role data";
          return Task.FromResult(response);
        }

        if (string.IsNullOrEmpty(username))
        {
          response.Success = false;
          response.Message = "username claim was not found";
          return Task.FromResult(response);
        }

        // Check if a role with the same name already exists
        var existingRole = _context.RoleMaster.FirstOrDefault(r => r.rolename == request.rolename);
        if (existingRole != null)
        {
          response.Message = "Role with the same name already exists" + existingRole.rolename;
          response.Success = false;
          return Task.FromResult(response);
        }

        request.ModifiedBy = username;
        request.ModifiedDatetime = DateTime.UtcNow;

        _context.RoleMaster.Add(request);
        _context.SaveChanges();

        response.Message = "Role created successfully";
        response.Success = true;
        return Task.FromResult(response);
      }
      catch (Exception ex)
      {
        _logger.Debug("Error on creating role: " + ex.StackTrace);
        response.Message = ex.Message.ToString();
        response.Success = false;
        return Task.FromResult(response);
      }
    }

    public Task<BaseResponse<string>> CreateUserRole(
      string username,
      UserRoleDetailsRequest request
    )
    {
      BaseResponse<string> response = new BaseResponse<string>();
      try
      {
        if (string.IsNullOrEmpty(username))
        {
          response.Message = "username claim not found";
          response.Success = false;
          return Task.FromResult(response);
        }
        if (request == null || request.RoleIds == null || !request.RoleIds.Any())
        {
          response.Message = "Invalid request or no roles provided";
          response.Success = false;
          return Task.FromResult(response);
        }

        var user = _context.UserDatas.FirstOrDefault(u => u.Email == request.Email);

        if (user == null)
        {
          response.Message = $"No users found with the email: {request.Email}";
          response.Success = false;
          return Task.FromResult(response);
        }

        foreach (var roleId in request.RoleIds)
        {
          var role = _context.RoleMaster.FirstOrDefault(r => r.role_id == roleId);

          if (role == null)
          {
            response.Message = "Role with ID  not found";
            response.Success = false;
            return Task.FromResult(response);
          }

          var existingRecord = _context.UsersRoles.FirstOrDefault(r =>
            r.useremail == user.Email && r.RoleId == role.role_id
          );

          if (existingRecord != null)
          {
            response.Message = "User already has role : " + role.rolename;
            response.Success = false;
            return Task.FromResult(response);
          }

          var userRoleDetails = new UsersRoles
          {
            useremail = user.Email,
            RoleId = role.role_id,
            ModifiedBy = username,
            ModifiedDatetime = DateTime.UtcNow
          };

          _context.UsersRoles.Add(userRoleDetails);
        }

        _context.SaveChanges();
        response.Message = "User roles created successfully";
        response.Success = true;
        return Task.FromResult(response);
      }
      catch (Exception ex)
      {
        _logger.Debug("Error on creating user roles: " + ex.StackTrace);
        response.Message = ex.Message.ToString();
        response.Success = false;
        return Task.FromResult(response);
      }
    }

    public Task<BaseResponse<string>> DeleteRole(int id)
    {
      BaseResponse<string> response = new BaseResponse<string>();

      try
      {
        // Retrieve the user role details based on the row ID
        var role = _context.RoleMaster.FirstOrDefault(ur => ur.role_id == id);
        if (role == null)
        {
          response.Message = "role details not found";
          response.Success = false;
          return Task.FromResult(response);
        }

        // Remove the user role from the context and save changes
        _context.RoleMaster.Remove(role);
        _context.SaveChanges();

        response.Message = "role deleted successfully";
        response.Success = true;
        return Task.FromResult(response);
      }
      catch (Exception ex)
      {
        _logger.Debug("Error deleting role: " + ex.StackTrace);
        response.Message = ex.Message.ToString();
        response.Success = false;
        return Task.FromResult(response);
      }
    }

    public Task<BaseResponse<string>> DeleteUserRole(int id)
    {
      BaseResponse<string> response = new BaseResponse<string>();

      try
      {
        var userRole = _context.UsersRoles.FirstOrDefault(ur => ur.Id == id);
        if (userRole == null)
        {
          response.Message = "User role details not found";
          response.Success = false;
          return Task.FromResult(response);
        }

        _context.UsersRoles.Remove(userRole);
        _context.SaveChanges();

        response.Message = "User role deleted successfully";
        response.Success = true;
        return Task.FromResult(response);
      }
      catch (Exception ex)
      {
        _logger.Debug("Error deleting user role: " + ex.StackTrace);
        response.Message = ex.Message.ToString();
        response.Success = false;
        return Task.FromResult(response);
      }
    }

    public Task<BaseResponse<IEnumerable<GetRole>>> GetRoles()
    {
      BaseResponse<IEnumerable<GetRole>> response = new BaseResponse<IEnumerable<GetRole>>();

      try
      {
        // Retrieve all roles with their IDs from the Roles table
        var roles = _context
          .RoleMaster.Select(role => new GetRole
          {
            roleId = role.role_id,
            roleName = role.rolename
          })
          .ToList();

        if (roles == null || !roles.Any())
        {
          response.Message = "No roles found";
          response.Success = false;
          return Task.FromResult(response);
        }
        response.Message = "Roles Retireved Successfully";
        response.Success = true;
        response.Data = roles;
        return Task.FromResult(response);
      }
      catch (Exception ex)
      {
        response.Message = ex.Message.ToString();
        response.Success = false;
        response.Data = null;
        return Task.FromResult(response);
      }
    }

    public Task<BaseResponse<IEnumerable<UserRoleDto>>> GetUserRole()
    {
      BaseResponse<IEnumerable<UserRoleDto>> response =
        new BaseResponse<IEnumerable<UserRoleDto>>();
      try
      {
        // Retrieve all user role details with rolename from the database
        var userRolesWithRoleName = _context
          .UsersRoles.Include(ur => ur.Role) // Include the Role navigation property
          .ToList();

        if (userRolesWithRoleName == null || userRolesWithRoleName.Count == 0)
        {
          response.Message = "No user role details found";
          response.Success = false;
          return Task.FromResult(response);
        }
        // Project the result to UserRoleDto
        var userRolesDto = userRolesWithRoleName.Select(ur => new UserRoleDto
        {
          Id = ur.Id,
          displayname =
            _context.UserDatas.FirstOrDefault(u => u.Email == ur.useremail)?.DisplayName ?? "",
          useremail = ur.useremail,
          RoleId = ur.RoleId,
          Rolename = ur.Role.rolename,
          ModifiedBy = ur.ModifiedBy,
          ModifiedDatetime = ur.ModifiedDatetime
        });
        response.Message = "UserRole Retrieved Successfully";
        response.Success = true;
        response.Data = userRolesDto;
        return Task.FromResult(response);
      }
      catch (Exception ex)
      {
        _logger.Debug("Error on retrieving user roles: " + ex.StackTrace);
        response.Message = ex.Message.ToString();
        response.Success = true;
        response.Data = null;
        return Task.FromResult(response);
      }
    }

    public Task<BaseResponse<string>> UpdateRole(int id, string username, RoleUpdateRequest request)
    {
      BaseResponse<string> response = new BaseResponse<string>();
      try
      {
        if (request == null)
        {
          response.Message = "Invalid request";
          response.Success = false;
          return Task.FromResult(response);
        }

        if (string.IsNullOrEmpty(username))
        {
          response.Message = "username claim not found";
          response.Success = false;
          return Task.FromResult(response);
        }

        var existingRole = _context.RoleMaster.FirstOrDefault(r => r.role_id == id);
        if (existingRole == null)
        {
          response.Message = "Role not found";
          response.Success = false;
          return Task.FromResult(response);
        }

        // Check if the updated role name conflicts with existing roles
        var duplicateRole = _context.RoleMaster.FirstOrDefault(r =>
          r.rolename == request.rolename && r.role_id != id
        );
        if (duplicateRole != null)
        {
          response.Message = "role name already exists";
          response.Success = false;
          return Task.FromResult(response);
        }

        // Update the role properties
        existingRole.rolename = request.rolename;
        existingRole.description = request.description;
        existingRole.ModifiedBy = username;
        existingRole.ModifiedDatetime = DateTime.UtcNow;

        _context.RoleMaster.Update(existingRole);
        _context.SaveChanges();
        response.Message = "Role updated successfully";
        response.Success = true;
        return Task.FromResult(response);
      }
      catch (Exception ex)
      {
        _logger.Debug("Error on updating role: " + ex.StackTrace);
        response.Message = ex.Message.ToString();
        response.Success = false;
        return Task.FromResult(response);
      }
    }

    public Task<BaseResponse<string>> UpdateUserRole(
      string email,
      string username,
      UserRoleUpdateRequest request
    )
    {
      BaseResponse<string> response = new BaseResponse<string>();
      try
      {
        if (string.IsNullOrEmpty(username))
        {
          response.Success = false;
          response.Message = "username claim not found";
          return Task.FromResult(response);
        }

        if (request == null || request.RoleIds == null || !request.RoleIds.Any())
        {
          response.Success = false;
          response.Message = "Invalid request or no roles provided";
          return Task.FromResult(response);
        }

        var user = _context.UserDatas.FirstOrDefault(u => u.Email == email);

        if (user == null)
        {
          response.Success = false;
          response.Message = $"No users found with the email: {email}";
          return Task.FromResult(response);
        }

        // Remove existing user roles
        var existingUserRoles = _context
          .UsersRoles.Where(ur => ur.useremail == user.Email)
          .ToList();

        _context.UsersRoles.RemoveRange(existingUserRoles);

        // Add updated user roles
        foreach (var roleId in request.RoleIds)
        {
          var role = _context.RoleMaster.FirstOrDefault(r => r.role_id == roleId);

          if (role == null)
          {
            response.Message = $"Role with ID {roleId} not found";
            response.Success = false;
            return Task.FromResult(response);
          }

          var userRoleDetails = new UsersRoles
          {
            useremail = user.Email,
            RoleId = role.role_id,
            ModifiedBy = username,
            ModifiedDatetime = DateTime.UtcNow
          };

          _context.UsersRoles.Add(userRoleDetails);
        }

        _context.SaveChanges();
        response.Message = "User roles updated successfully";
        response.Success = true;
        return Task.FromResult(response);
      }
      catch (Exception ex)
      {
        _logger.Debug("Error on updating user roles: " + ex.StackTrace);
        response.Success = false;
        response.Message = ex.Message.ToString();
        return Task.FromResult(response);
      }
    }

    public async Task<BaseResponse<string>> CreateHoliday(string username, Holidays request)
    {
      BaseResponse<string> response = new BaseResponse<string>();
      try
      {
        var existingHoliday = await _context.Holidays.FirstOrDefaultAsync(h =>
          h.Holiday == request.Holiday || h.Date == request.Date.ToUniversalTime()
        );
        if (existingHoliday != null)
        {
          response.Message = "Holidays already exist.";
          response.Success = false;
          return response;
        }

        if (string.IsNullOrEmpty(username))
        {
          response.Message = " Username claim is not found.";
          response.Success = false;
          return response;
        }
        request.Id = Guid.NewGuid().ToString();
        request.ModifiedBy = username;
        request.ModifiedTime = DateTime.UtcNow;
        request.Date = request.Date.ToUniversalTime();

        _context.Holidays.Add(request);
        await _context.SaveChangesAsync();

        response.Message = " Holiday Added Successfully";
        response.Success = true;
        return response;
      }
      catch (Exception ex)
      {
        response.Message = ex.Message.ToString();
        response.Success = false;
        return response;
      }
    }

    public async Task<BaseResponse<string>> UpdateHoliday(
      string Id,
      string username,
      Holidays request
    )
    {
      BaseResponse<string> response = new BaseResponse<string>();
      try
      {
        var holidayToUpdate = await _context.Holidays.FindAsync(Id);

        if (holidayToUpdate == null)
        {
          response.Message = "Holidays is not found";
          response.Success = false;
          return response;
        }

        // Update properties of the holiday
        holidayToUpdate.Holiday = request.Holiday;
        holidayToUpdate.Date = request.Date.ToUniversalTime();
        holidayToUpdate.Location = request.Location;
        holidayToUpdate.Branch = request.Branch;

        holidayToUpdate.ModifiedBy = username;
        holidayToUpdate.ModifiedTime = DateTime.UtcNow;

        await _context.SaveChangesAsync(); // Save changes to the database
        response.Message = "Holidays Updated Successfully";
        response.Success = true;
        return response;
      }
      catch (Exception ex)
      {
        response.Message = ex.Message.ToString();
        response.Success = false;
        return response;
      }
    }

    public Task<BaseResponse<string>> CreateProject(string username, ProjectMaster request)
    {
      BaseResponse<string> response = new BaseResponse<string>();
      try
      {
        var existingproject = _context.ProjectMaster.FirstOrDefault(a =>
          a.ProjectName == request.ProjectName
        );

        if (existingproject != null)
        {
          response.Message =
            "project with the same name already exists : " + existingproject.ProjectName;
          response.Success = false;
          return Task.FromResult(response);
        }
        var project = new ProjectMaster
        {
          Id = Guid.NewGuid().ToString(),
          ProjectName = request.ProjectName,
          ModifiedBy = username,
          ModifiedDatetime = DateTime.UtcNow
        };

        _context.ProjectMaster.Add(project);
        _context.SaveChanges();

        _logger.Information("project created successfully");
        response.Message = "project created successfully";
        response.Success = true;
        return Task.FromResult(response);
      }
      catch (Exception ex)
      {
        _logger.Debug("Error in creating project  : " + ex.Message);
        _logger.Error("Error in creating project  : " + ex.StackTrace);
        response.Message = ex.Message.ToString();
        response.Success = false;
        return Task.FromResult(response);
      }
    }

    public Task<BaseResponse<string>> UpdateProject(
      string projectId,
      string username,
      ProjectUpdate request
    )
    {
      BaseResponse<string> response = new BaseResponse<string>();
      try
      {
        var existingProject = _context.ProjectMaster.FirstOrDefault(p => p.Id == projectId);

        if (existingProject == null)
        {
          response.Message = "Project not found";
          response.Success = false;
          return Task.FromResult(response);
        }

        // Update project properties
        existingProject.ProjectName = request.ProjectName;
        existingProject.ModifiedBy = username;
        existingProject.ModifiedDatetime = DateTime.UtcNow;

        // You may want to update more properties here as needed

        _context.ProjectMaster.Update(existingProject);
        _context.SaveChanges();

        _logger.Information("project updated successfully");
        response.Message = "Project Updated Successfully";
        response.Success = true;
        return Task.FromResult(response);
      }
      catch (Exception ex)
      {
        _logger.Debug("Error in updating project  : " + ex.Message);
        _logger.Error("Error in updating project  : " + ex.StackTrace);
        response.Message = ex.Message.ToString();
        response.Success = false;
        return Task.FromResult(response);
      }
    }
  }
}
