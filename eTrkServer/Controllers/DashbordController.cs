using eTrkServer.Controllers;
using eTrkServer.DTO.RequestDTO;
using eTrkServer.Interface;
using Microsoft.AspNetCore.Mvc;

namespace eTrkServer.Controllers
{
  [ApiController]
  [Route("api/v1/monitoruser")]
  public class DashboardController : BaseController
  {
    private readonly IDashboardService _dashboardService;

    private readonly Serilog.ILogger _logger;
    private readonly AppDbContext _context;

    public DashboardController(
      Serilog.ILogger logger,
      AppDbContext context,
      IDashboardService dashboardService
    )
    {
      _context = context;
      _dashboardService = dashboardService;
      _logger = logger;
    }

    [HttpPost("divisions/{division}/projects/{project}/user/worksummarygraph")]
    public async Task<IActionResult> GetWorkingSummaryGraph(
      [FromBody] WorkSummaryRequest request,
      string division,
      string project
    )
    {
      var response = await _dashboardService.GetWorkSummaryGraph(request, division, project);

      if (response.Success)
      {
        return Ok(response.Data);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpPost("divisions/{division}/projects/{project}/user/ipdetails")]
    public async Task<IActionResult> GetIpAddress(
      [FromBody] IPAddressRequest request,
      string division,
      string project
    )
    {
      var response = await _dashboardService.GetIpAddress(request, division, project);

      if (response.Success)
      {
        return Ok(response.Data);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpPost("divisions/{division}/projects/{project}/user/worksummary")]
    public async Task<IActionResult> GetUsersWorkSummary(
      string division,
      string project,
      [FromBody] WorkSummaryRequest requestBody
    )
    {
      try
      {
        var (dateWiseMetrics, totalHours) = await _dashboardService.GetWorkSummary(
          requestBody,
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

    [HttpPost("divisions/{division}/projects/{project}/user/applicationusage")]
    public async Task<IActionResult> GetApplicationUsage(
      string division,
      string project,
      [FromBody] ApplicationUsageRequest request
    )
    {
      var response = await _dashboardService.GetApplicationUsage(request, division, project);

      if (response.Success)
      {
        return Ok(response.Data);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpPost("divisions/{division}/projects/{project}/user/userapplicationusage")]
    public async Task<IActionResult> GetUsersApplicationUsage(
      string division,
      string project,
      [FromBody] ApplicationUsageRequest request
    )
    {
      var response = await _dashboardService.GetUserApplicationUsage(request, division, project);

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
