using System.Security.Cryptography;
using System.Text;
using eTrkServer.Controllers;
using eTrkServer.DTO.RequestDTO;
using eTrkServer.Entity;
using eTrkServer.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace eTrkServer.Controllers
{
  [Authorize(Roles = "Admin")]
  [ApiController]
  [Route("api/v1/monitoruser/adminscreen")]
  public class UserDetailsController : BaseController
  {
    private readonly AppDbContext _context;

    private readonly Serilog.ILogger _logger;
    private readonly IConfiguration _configuration;

    private readonly IUserService _userService;

    public UserDetailsController(
      AppDbContext context,
      Serilog.ILogger logger,
      IConfiguration configuration,
      IUserService userService
    )
    {
      _context = context;
      _userService = userService;
      _logger = logger;
      _configuration = configuration;
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUserData([FromBody] UserDatasPost request)
    {
      var response = await _userService.CreateUser(GetUserNameFromClaims(), request);
      if (response.Success)
      {
        return Ok(response.Message);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetActiveUsers()
    {
      var response = await _userService.GetUser();
      if (response.Success)
      {
        return Ok(response.Data);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpGet("users/{id}")]
    public IActionResult GetUserDetailsById(string id)
    {
      try
      {
        // Retrieve user details by ID
        var userDetails = _context.UserDatas.FirstOrDefault(u => u.Id == id);

        // Check if user details exist
        if (userDetails == null)
        {
          return Ok("User details not found");
        }

        // Return user details
        return Ok(userDetails);
      }
      catch (Exception ex)
      {
        _logger.Debug("Error fetching user details by ID: " + ex.StackTrace);
        return StatusCode(400, "Error fetching user details by ID: " + ex.Message);
      }
    }

    [HttpPut("users/{Id}")]
    public async Task<IActionResult> UpdateUser(string Id, [FromBody] UsersDetailsUpdate request)
    {
      var response = await _userService.UpdateUser(Id, GetUserNameFromClaims(), request);
      if (response.Success)
      {
        return Ok(response.Message);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
      var response = await _userService.DeleteUser(id);
      if (response.Success)
      {
        return Ok(response.Message);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpPost("userroles")]
    public async Task<IActionResult> CreateUserRoles([FromBody] UserRoleDetailsRequest request)
    {
      var response = await _userService.CreateUserRole(GetUserNameFromClaims(), request);
      if (response.Success)
      {
        return Ok(response.Message);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpGet("userroles")]
    public async Task<IActionResult> GetAllUserRoles()
    {
      var response = await _userService.GetUserRole();
      if (response.Success)
      {
        return Ok(response.Data);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpPut("userroles/{email}")]
    public async Task<IActionResult> UpdateUserRoles(
      string email,
      [FromBody] UserRoleUpdateRequest request
    )
    {
      var response = await _userService.UpdateUserRole(email, GetUserNameFromClaims(), request);
      if (response.Success)
      {
        return Ok(response.Message);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpGet("userroles/{id}")]
    public IActionResult GetUserRoleDetailsById(int id)
    {
      try
      {
        // Retrieve user role details based on the provided ID
        var userRoleDetails = _context.UsersRoles.FirstOrDefault(r => r.Id == id);

        // If user role details are not found, return NotFound
        if (userRoleDetails == null)
        {
          return NotFound("User role details not found");
        }

        // Return the user role details
        return Ok(userRoleDetails);
      }
      catch (Exception ex)
      {
        _logger.Debug("Error retrieving user role details by ID: " + ex.Message);
        return StatusCode(400, "Error retrieving user role details by ID: " + ex.Message);
      }
    }

    [HttpDelete("userrole/{Id}")]
    public async Task<IActionResult> DeleteUserRoleByRowId(int Id)
    {
      var response = await _userService.DeleteUserRole(Id);
      if (response.Success)
      {
        return Ok(response.Message);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpPost("roles")]
    public async Task<IActionResult> CreateRole([FromBody] RoleMaster request)
    {
      var response = await _userService.CreateRole(GetUserNameFromClaims(), request);
      if (response.Success)
      {
        return Ok(response.Message);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpGet("roles")]
    public async Task<IActionResult> GetAllRoles()
    {
      var response = await _userService.GetRoles();
      if (response.Success)
      {
        return Ok(response.Data);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpPut("roles/{id}")]
    public async Task<IActionResult> UpdateRoleAsync(int id, [FromBody] RoleUpdateRequest request)
    {
      var response = await _userService.UpdateRole(id, GetUserNameFromClaims(), request);
      if (response.Success)
      {
        return Ok(response.Message);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpDelete("roles/{Id}")]
    public async Task<IActionResult> DeleteRolesAsync(int Id)
    {
      var response = await _userService.DeleteRole(Id);
      if (response.Success)
      {
        return Ok(response.Message);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpPost("createproject")]
    public async Task<IActionResult> PostProjectAsync([FromBody] ProjectMaster request)
    {
      var response = await _userService.CreateProject(GetUserNameFromClaims(), request);

      if (response.Success)
      {
        return Ok(response.Message);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpPut("updateproject/{projectId}")]
    public async Task<IActionResult> PutProjectAsync(string projectId, ProjectUpdate request)
    {
      var response = await _userService.UpdateProject(projectId, GetUserNameFromClaims(), request);

      if (response.Success)
      {
        return Ok(response.Message);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpGet("getprojects")]
    public async Task<ActionResult<List<ProjectMaster>>> GetProjects()
    {
      var projects = await _context.ProjectMaster.ToListAsync();
      return projects;
    }

    [HttpGet("holiday")]
    public async Task<ActionResult<IEnumerable<Holidays>>> GetHolidays()
    {
      var holidays = await _context.Holidays.ToListAsync();
      return holidays;
    }

    [HttpPost("holiday")]
    public async Task<ActionResult> PostHolidays(Holidays request)
    {
      var response = await _userService.CreateHoliday(GetUserNameFromClaims(), request);
      if (response.Success)
      {
        return Ok(response.Message);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpPut("holiday/{id}")]
    public async Task<ActionResult<Holidays>> UpdateHolidays(string id, Holidays request)
    {
      var response = await _userService.UpdateHoliday(id, GetUserNameFromClaims(), request);
      if (response.Success)
      {
        return Ok(response.Message);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }
  }
}
