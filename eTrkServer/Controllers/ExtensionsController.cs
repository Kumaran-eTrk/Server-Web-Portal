using eTrkServer.Controllers;
using eTrkServer.DTO.RequestDTO;
using eTrkServer.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace eTrkServer.Controllers
{
  [Authorize(Roles = "Admin,System Admin")]
  [ApiController]
  [Route("api/v1/monitoruser/extensions")]
  public class ExtensionsController : BaseController
  {
    private readonly IExtensionService _extensionService;

    public ExtensionsController(IExtensionService extensionService)
    {
      _extensionService = extensionService;
    }

    [HttpPost("createextension")]
    public async Task<IActionResult> CreateExtensions([FromBody] ExtensionPost entityInfo)
    {
      var response = await _extensionService.CreateExtensionAsync(entityInfo);

      if (response.Success)
      {
        return Ok(new { response = response.Message });
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpPut("updateextension/{extensionId}")]
    public async Task<IActionResult> UpdateExtensions(
      string extensionId,
      ExtensionStatusUpdateDto request
    )
    {
      var response = await _extensionService.UpdateExtensionAsync(
        extensionId,
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
      var response = await _extensionService.GetUnknownExtensionAsync();

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
      var response = await _extensionService.GetAcceptedExtensionAsync();

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
    public async Task<IActionResult> GetRejectedExtensions()
    {
      var response = await _extensionService.GetRejectedExtensionAsync();

      if (response.Success)
      {
        return Ok(response.Data);
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpGet("history/{extensionId}")]
    public async Task<ActionResult> GetHistoryByExtensionId(string extensionId)
    {
      var response = await _extensionService.GetHistoryByExtensionId(extensionId);

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
      var response = await _extensionService.GetRejectedUsage();

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
