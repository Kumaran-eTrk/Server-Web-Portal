using eTrkServer.DTO.RequestDTO;
using eTrkServer.Entity;
using eTrkServer.Interface;
using eTrkServer.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace eTrkServer.Controllers
{
  [ApiController]
  [Authorize(Roles = "Agent")]
  [Route("api/monitoruser")]
  public class UserActivitiesController : ControllerBase
  {
    private readonly AppDbContext _context;

    private readonly IWebHostEnvironment _webHostEnvironment;
    private readonly Serilog.ILogger _logger;
    private readonly IConfiguration _configuration;

    private readonly IUserMonitorService _userMonitorService;

    public UserActivitiesController(
      AppDbContext context,
      IConfiguration configuration,
      IWebHostEnvironment hostingEnvironment,
      IUserMonitorService userMonitorService,
      Serilog.ILogger logger
    )
    {
      _context = context;
      _webHostEnvironment = hostingEnvironment;
      _logger = logger;
      _configuration = configuration;
      _userMonitorService = userMonitorService;
    }

    [HttpPost("useractivities")]
    public async Task<IActionResult> AddUserActivity([FromBody] UserActivity userActivity)
    {
      var response = await _userMonitorService.GetUserActivity(userActivity);

      if (response.Success)
      {
        return Ok(new { Id = response.Data });
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpPost("usermetadata")]
    public async Task<IActionResult> AddUserMetaDataAsync([FromBody] UserMetadata userMetaData)
    {
      var response = await _userMonitorService.GetUserMetaData(userMetaData);

      if (response.Success)
      {
        return Ok(new { Id = response.Data });
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpPost("ipaddressinfo")]
    public async Task<IActionResult> AddIpAddressAsync([FromBody] IPAddressInfo ipAddressInfo)
    {
      var response = await _userMonitorService.GetIpAddress(ipAddressInfo);

      if (response.Success)
      {
        return Ok(new { Id = response.Data });
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpPost("userlogging")]
    public async Task<IActionResult> AddUserLogging(
      [FromBody] UserLoggingActivity userLoggingActivity
    )
    {
      var response = await _userMonitorService.GetLoggingActivity(userLoggingActivity);

      if (response.Success)
      {
        return Ok(new { Id = response.Data });
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    [HttpGet("currentversion")]
    public async Task<IActionResult> GetCurrentVersion()
    {
      UpdaterModel uModel = _context
        .UpdaterModels.OrderByDescending(x => x.FromDate)
        .FirstOrDefault();
      _logger.Debug("uModer version for file : " + uModel.Path);
      return Ok(JsonConvert.SerializeObject(uModel));
    }

    [HttpGet("currentversion/{version}/{machine}")]
    public async Task<IActionResult> GetVersion(string version, string machine)
    {
      DateTime startOfDay = DateTime.Today.ToUniversalTime();

      _logger.Debug(
        "Getting new version for file : " + version + " - " + _webHostEnvironment.ContentRootPath
      );
      Console.WriteLine("version : " + version);
      UpdaterModel uModel = _context
        .UpdaterModels.Where(x => x.VersionId.Equals(version))
        .FirstOrDefault();

      if (uModel != null)
      {
        Console.WriteLine("Version Already Installed : " + uModel.VersionId);
        return NoContent();
      }
      else
      {
        //var zipFilePath = Path.Combine(_webHostEnvironment.ContentRootPath, "Versions", uModel.Path);
        UpdaterModel latestversion = _context
          .UpdaterModels.Where(x => x.VersionId != version)
          .FirstOrDefault();
        Console.WriteLine("latest version of app : " + latestversion.VersionId, machine);

        var zipFilePath = Path.Combine(
          _webHostEnvironment.ContentRootPath,
          "Versions",
          machine,
          latestversion.VersionId,
          machine == "Windows" ? "usermonitor.zip" : "MonitorUser-0.1-py3-none-any.whl"
        );
        if (!System.IO.File.Exists(zipFilePath))
        {
          _logger.Debug("Zip file does not exists: " + zipFilePath);
          return NotFound();
        }
        var memory = new MemoryStream();
        using (var stream = new FileStream(zipFilePath, FileMode.Open))
        {
          stream.CopyTo(memory);
        }
        memory.Position = 0;
        Console.WriteLine("file sent successfully");
        return File(memory, "application/zip", Path.GetFileName(zipFilePath));
      }
    }

    [HttpPost("extensiondetails")]
    public async Task<IActionResult> AddEntityInfoAsync([FromBody] ExtensionDTo entityInfo)
    {
      var response = await _userMonitorService.GetExtensions(entityInfo);

      if (response.Success)
      {
        return Ok(new { Id = response.Data });
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }

    // Software Table

    [HttpPost("softwaredetails")]
    public async Task<IActionResult> AddSoftwareInfoAsync([FromBody] Softwareinfo entityInfo)
    {
      var response = await _userMonitorService.GetSoftwares(entityInfo);

      if (response.Success)
      {
        return Ok(new { Id = response.Data });
      }
      else
      {
        return StatusCode(400, new { error = response.Message });
      }
    }
  }
}
