using eTrkServer.DTO.RequestDTO;
using eTrkServer.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace eTrkServer.Controllers
{
  [ApiController]
  [Authorize(Roles = "Admin,Manager,System Admin")]
  [Route("api/v1/monitoruser/adminscreen")]
  public class AdminController : BaseController
  {
    private readonly IAdminService _adminService;
    private readonly AppDbContext _context;
    private readonly Serilog.ILogger _logger;
    private readonly IConfiguration _configuration;

    public AdminController(
      Serilog.ILogger logger,
      AppDbContext context,
      IAdminService adminService,
      IConfiguration configuration
    )
    {
      _context = context;
      _adminService = adminService;
      _logger = logger;
      _configuration = configuration;
    }

    [Authorize(Roles = "Admin,System Admin")]
    [HttpGet]
    [Route("agentstatus")]
    public async Task<IActionResult> GetAgentActivity()
    {
      var response = await _adminService.GetAgentStatus();

      if (response.Success)
      {
        return Ok(response.Data);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpPost("userloginstatus")]
    public async Task<IActionResult> UserLoginStatus([FromBody] LoginStatus request)
    {
      var response = await _adminService.GetLoginStatus(
        request,
        GetUserEmailFromClaims(),
        GetUserRolesFromClaims()
      );

      if (response.Success)
      {
        return Ok(response.Data);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpGet("getusers")]
    public async Task<IActionResult> GetUsersAsync()
    {
      var response = await _adminService.GetALlUsers(
        GetUserEmailFromClaims(),
        GetUserRolesFromClaims()
      );

      if (response.Success)
      {
        return Ok(new { Users = response.Data });
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpPost("userfilters")]
    public async Task<IActionResult> PostFilteredDataAsync([FromBody] FilterDataRequest request)
    {
      var response = await _adminService.GetFilterData(
        request,
        GetUserEmailFromClaims(),
        GetUserRolesFromClaims()
      );

      if (response.Success)
      {
        return Ok(response.Data);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpGet("userrecordings")]
    public async Task<IActionResult> GenerateVideo(string email, DateTime fromDate, DateTime toDate)
    {
      var response = await _adminService.GetUserRecording(email, fromDate, toDate);

      if (response.Success)
      {
        return Ok(response.Data);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpPost("divisions/{division}/projects/{project}/user/holidayworksummary")]
    public async Task<IActionResult> GetHolidayandWeekends(
      [FromBody] HolidayWorkSummaryRequest request,
      string division,
      string project
    )
    {
      try
      {
        var (dateWiseMetrics, totalHours) = await _adminService.GetHolidayWorkSummary(
          request,
          division,
          project
        );

        var totalHoursArray = new[] { totalHours };

        return Ok(new { DateWiseMetrics = dateWiseMetrics, TotalHours = totalHoursArray });
      }
      catch (Exception ex)
      {
        _logger.Error(ex, "Error fetching work summary");
        return StatusCode(400, new { Error = ex.Message });
      }
    }

    [HttpPost("usercomparision")]
    public async Task<IActionResult> GetUserComparision([FromBody] UserComparison request)
    {
      var response = await _adminService.GetUserComparision(request);

      if (response.Success)
      {
        return Ok(new { UserComparison = response.Data });
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpPost("averagehours")]
    public async Task<IActionResult> GetAverageHours([FromBody] AverageHours request)
    {
      var response = await _adminService.GetAverageHours(request);

      if (response.Success)
      {
        return Ok(response.Data);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpPost("workingpattern")]
    public async Task<IActionResult> GetWorkingPattern(
      [FromBody] WorkingPattern request,
      string email
    )
    {
      var response = await _adminService.GetWorkingPattern(request, email);

      if (response.Success)
      {
        return Ok(response.Data);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }
  }
}
