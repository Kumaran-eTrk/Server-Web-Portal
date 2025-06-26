using eTrkServer.Controllers;
using eTrkServer.DTO.RequestDTO;
using eTrkServer.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace eTrkServer.Controllers
{
  [Authorize(Roles = "Admin,System Admin")]
  [ApiController]
  [Route("api/v1/monitoruser/softwares")]
  public class SoftwareController : BaseController
  {
    private readonly EmailService _emailService;
    private readonly ISoftwareService _softwareService;

    public SoftwareController(EmailService emailServices, ISoftwareService softwareService)
    {
      _softwareService = softwareService;
      _emailService = emailServices;
    }

    [HttpPost("createsoftware")]
    public async Task<IActionResult> CreateSoftware([FromBody] SoftwarePostDto entityInfo)
    {
      // Create a new MasterExtensions record
      var response = await _softwareService.CreateSoftwareAsync(entityInfo);

      if (response.Success)
      {
        return Ok(new { response = response.Message });
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpPut("updatesoftware/{softwareId}")]
    public async Task<IActionResult> UpdateSoftware(
      string softwareId,
      [FromBody] SoftwareStatusUpdateDto request
    )
    {
      var response = await _softwareService.UpdateSoftwareAsync(
        softwareId,
        GetUserNameFromClaims(),
        request
      );

      if (response.Success)
      {
        return Ok(new { response = response.Message });
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpGet("unknownstatus")]
    public async Task<IActionResult> GetUnknownExtensions()
    {
      var response = await _softwareService.GetUnknownSoftwareAsync();

      if (response.Success)
      {
        return Ok(response.Data);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpGet("acceptedstatus")]
    public async Task<IActionResult> GetAcceptedExtensions()
    {
      var response = await _softwareService.GetAcceptedSoftwareAsync();

      if (response.Success)
      {
        return Ok(response.Data);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpGet("rejectedstatus")]
    public async Task<IActionResult> GRejectedExtensions()
    {
      var response = await _softwareService.GetRejectedSoftwareAsync();

      if (response.Success)
      {
        return Ok(response.Data);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpGet("history/{softwareId}")]
    public async Task<ActionResult> GetHistoryBySoftwareId(string softwareId)
    {
      // Fetch History records based on the provided ExtensionID
      var response = await _softwareService.GetHistoryBySoftwareId(softwareId);

      if (response.Success)
      {
        return Ok(response.Data);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpGet("rejectedusage")]
    public async Task<IActionResult> GetRejectedUsage()
    {
      var response = await _softwareService.GetRejectedUsage();

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
