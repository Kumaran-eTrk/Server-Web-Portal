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
  public class ProductivityController : BaseController
  {
    private readonly AppDbContext _context;

    private readonly Serilog.ILogger _logger;

    private readonly IProductivityService _productivityService;

    public ProductivityController(
      AppDbContext context,
      Serilog.ILogger logger,
      IProductivityService productivityService
    )
    {
      _context = context;

      _productivityService = productivityService;
      _logger = logger;
    }

    [HttpGet("AppProductivity/unmatched")]
    public async Task<ActionResult<IEnumerable<string>>> GetUnmatchedApplicationsAsync()
    {
      var response = await _productivityService.GetUnMacthedApplications();

      if (response.Success)
      {
        return Ok(response.Data);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpGet("getapplications")]
    public async Task<ActionResult<List<ApplicationMaster>>> GetAllApplications()
    {
      var applications = await _context.ApplicationMaster.ToListAsync();
      return applications;
    }

    [HttpPost("createapplication")]
    public async Task<IActionResult> CreateApplicationAsync(ApplicationMaster request)
    {
      var response = await _productivityService.CreateApplication(GetUserNameFromClaims(), request);

      if (response.Success)
      {
        return Ok(response.Message);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpPut("updateapplications/{applicationId}")]
    public async Task<IActionResult> UpdateApplicationsAsync(
      string applicationId,
      ApplicationUpdate request
    )
    {
      var response = await _productivityService.UpdateApplication(
        applicationId,
        GetUserNameFromClaims(),
        request
      );

      if (response.Success)
      {
        return Ok(response.Message);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpDelete("deleteapplication/{id}")]
    public async Task<IActionResult> DeleteApplicationAsync(string id)
    {
      var response = await _productivityService.DeleteApplication(id);

      if (response.Success)
      {
        return Ok(response.Message);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpPost("createprojectapplication")]
    public async Task<IActionResult> PostProjectMappingsAsync(ProjectMappingDto request)
    {
      var response = await _productivityService.PostProjectMapping(
        GetUserNameFromClaims(),
        request
      );

      if (response.Success)
      {
        return Ok(response.Message);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpPost("getappproductivity")]
    public async Task<IActionResult> GetProjectMappingsAsync(string projectId)
    {
      var response = await _productivityService.GetProjectMapping(projectId);

      if (response.Success)
      {
        return Ok(response.Data);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpPut("updateprojectapplications")]
    public async Task<IActionResult> updateprojectapplicationsAsync(
      [FromBody] UpdateProjectApplicationsRequest request
    )
    {
      var response = await _productivityService.UpdateProjectApplication(
        GetUserNameFromClaims(),
        request
      );

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
