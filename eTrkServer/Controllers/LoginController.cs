using System.DirectoryServices.AccountManagement;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Principal;
using System.Text;
using eTrkServer.Controllers;
using eTrkServer.DTO.RequestDTO;
using eTrkServer.DTO.ResponseDTO;
using eTrkServer.Helpers;
using eTrkServer.Interface;
using eTrkServer.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RouteAttribute = Microsoft.AspNetCore.Mvc.RouteAttribute;

[Route("api/v1/monitoruser")]
[ApiController]
public class LoginController : BaseController
{
  private readonly AppDbContext _context;

  private readonly Serilog.ILogger _logger;
  private readonly Encryption encrypt;
  private readonly HashPassword password;
  private readonly IConfiguration _configuration;
  private readonly EmailService _emailservices;

  private readonly ILoginService _loginService;

  private readonly IUserMonitorService _userMonitorService;
  private bool useLDAP;

  public LoginController(
    AppDbContext context,
    Serilog.ILogger logger,
    IConfiguration configuration,
    EmailService emailservices,
    ILoginService loginService
  )
  {
    _context = context;
    _logger = logger;
    _configuration = configuration;
    _loginService = loginService;

    _emailservices = emailservices;
    encrypt = new Encryption(_configuration);
    password = new HashPassword();
    useLDAP = _configuration.GetValue<bool>("LdapAuthenication:mode");
  }

  [Authorize(Roles = "Admin")]
  [HttpPost("productinfo")]
  public async Task<IActionResult> productinfo()
  {
    var response = await _loginService.GetProductKey();

    if (response.Success)
    {
      return Ok(response.Data);
    }
    else
    {
      return StatusCode(400, new { error = response.Message });
    }
  }

  [Authorize(Roles = "Admin")]
  [HttpDelete("productinfo/{id}")]
  public async Task<IActionResult> DeleteProductInfo(string id)
  {
    try
    {
      var info = await _context.ProductInfo.FindAsync(id);
      if (info == null)
      {
        return NotFound("Product key not found.");
      }

      _context.ProductInfo.Remove(info);
      await _context.SaveChangesAsync();
      return Ok("Product key deleted successfully.");
    }
    catch (Exception ex)
    {
      _logger.Debug("Error in deleting product key : " + ex.Message);
      return BadRequest(ex.Message);
    }
  }

  [Authorize(Roles = "Admin")]
  [HttpGet("productinfo")]
  public async Task<IActionResult> GetProductInfo()
  {
    var response = await _loginService.GetProductInfo();

    if (response.Success)
    {
      return Ok(new { response = response.Data });
    }
    else
    {
      return StatusCode(400, new { error = response.Message });
    }
  }

  [HttpPost("agenttoken")]
  public async Task<IActionResult> agenttoken([FromBody] AgentToken request)
  {
    var response = await _loginService.GetAgentToken(request);

    if (response.Success)
    {
      Console.WriteLine("Agent Token : " + response.Data);
      return Ok(new { accesstoken = response.Data });
    }
    else
    {
      return StatusCode(400, new { error = response.Message });
    }
  }

  [HttpPost("screenshotconfig")]
  public async Task<IActionResult> ScreenshotSconfiguration(ScreenshotConfiguration request)
  {
    BaseResponse<ScreenshotConfigurationDTO> response =
      new BaseResponse<ScreenshotConfigurationDTO>();
    try
    {
      if (string.IsNullOrEmpty(request.UserName) || string.IsNullOrEmpty(request.DomainName))
      {
        response.Success = false;
        response.Message = "Invalid request: Missing required parameters.";
        _logger.Warning("Invalid request detected - missing UserName, DomainName, or MachineName.");
        return (IActionResult)response;
      }
      var user = await _context
        .UserDatas.Where(x =>
          x.LocalADUserName == request.UserName && x.LocalADDomain == request.DomainName
        )
        .FirstOrDefaultAsync();

      ScreenshotConfigurationDTO result = new ScreenshotConfigurationDTO
      {
        Username = request.UserName,
        Domainname = request.DomainName,
        Screenshot = user.IsScreenshot
      };
      response.Success = true;
      response.Message = "successfully retireved the screenshot configurations";
      response.Data = result;
      Console.WriteLine("successfully got the config");
      return Ok(new { result = response.Data });
    }
    catch (Exception ex)
    {
      Console.WriteLine("error in screnshot config : " + ex.Message);
      _logger.Error($"Error while getting screenshot configurations: {ex.Message}", ex);
      response.Success = false;
      response.Message = "An error occurred while processing the request.";
      return (IActionResult)response;
    }
  }

  [HttpPost("windows/login")]
  public IActionResult Login(string Username, string Password)
  {
    string domainName = WindowsIdentity.GetCurrent().Name.Split('\\')[0];

    using (PrincipalContext pc = new PrincipalContext(ContextType.Domain, domainName))
    {
      bool isValid = pc.ValidateCredentials(Username, Password);

      if (isValid)
      {
        var user = _context.UserDatas.FirstOrDefault(u =>
          u.LocalADUserName == Username && u.LocalADDomain == domainName
        );

        if (user != null)
        {
          // Additional user information

          string division = user.Division;
          string project = "";
          string userId = user.Id;
          string email = user.Email;
          string domain = user.LocalADDomain;

          var userRoles = _context
            .UsersRoles.Include(ur => ur.Role)
            .Where(ur => ur.useremail == user.Email)
            .ToList();

          if (!string.IsNullOrEmpty(user.ProjectId))
          {
            var userProject = _context.ProjectMaster.FirstOrDefault(p => p.Id == user.ProjectId);
            if (userProject != null)
            {
              project = userProject.ProjectName;
            }
          }

          string[] roles = new string[] { "User" }; // Default role if userRoles is empty
          if (userRoles.Any())
          {
            roles = userRoles.Select(ur => ur.Role?.rolename).ToArray();
          }

          string rolesString = string.Join(",", roles);
          var claims = new Dictionary<string, List<object>>
          {
            {
              "username",
              new List<object> { Username }
            },
            {
              "domain",
              new List<object> { domain }
            },
            {
              "user_role",
              new List<object> { rolesString }
            },
            {
              "division",
              new List<object> { division }
            },
            {
              "mail",
              new List<object> { email }
            },
            {
              "project",
              new List<object> { project }
            },
            {
              "userid",
              new List<object> { userId }
            }
          };

          var (accessToken, refreshToken) = GenerateTokenClass.GenerateTokens(
            claims,
            _configuration
          );

          return Ok(new { AccessToken = accessToken, RefreshToken = refreshToken });
        }
      }

      // Authentication failed
      return Unauthorized("Authentication failed");
    }
  }

  [HttpPost("ldap/login")]
  public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
  {
    var response = await _loginService.Login(loginRequest);

    if (response.Success)
    {
      return Ok(response.Data);
    }
    else
    {
      return StatusCode(400, new { error = response.Message });
    }
  }

  [HttpPost("refreshtoken")]
  public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
  {
    var response = await _loginService.RefreshToken(request);

    if (response.Success)
    {
      return Ok(new { accessToken = response.Data });
    }
    else
    {
      return StatusCode(400, new { error = response.Message });
    }
  }

  [HttpPost("appversion")]
  public async Task<IActionResult> GetAgentVersion([FromBody] AppVersion appVersion)
  {
    var response = await _userMonitorService.AppVersion(appVersion);

    if (response.Success)
    {
      return Ok(new { Id = response.Data });
    }
    else
    {
      return StatusCode(400, new { error = response.Message });
    }
  }

  [HttpPost("getusertoken")]
  public async Task<BaseResponse<TokenResponse>> GetClaims([FromBody] TokenRequest tokenRequest)
  {
    BaseResponse<TokenResponse> response = new BaseResponse<TokenResponse>();
    if (string.IsNullOrWhiteSpace(tokenRequest.Token))
    {
      response.Success = false;
      response.Message = " token is missing";
      return response;
    }

    var claims = GenerateTokenClass.ParseToken(tokenRequest.Token);

    try
    {
      if (claims.ContainsKey("preferred_username"))
      {
        List<string> uniqueNameList = claims["preferred_username"];
        string uniqueName = uniqueNameList.FirstOrDefault();

        var userDatas = _context.UserDatas.FirstOrDefault(u =>
          u.Email == uniqueName && u.isDelete == false
        );

        if (userDatas == null)
        {
          response.Success = false;
          response.Message = "User not found";
          return response;
        }

        // Now use the cached userDatas object for multiple fields
        var domain = userDatas.LocalADDomain;
        var username = userDatas.LocalADUserName;
        var division = userDatas.Division;
        var project = _context
          .ProjectMaster.FirstOrDefault(p => p.Id == userDatas.ProjectId)
          ?.ProjectName;
        var userId = userDatas.Id;

        var userRoles = _context
          .UsersRoles.Include(ur => ur.Role)
          .Where(ur => ur.useremail == uniqueName)
          .ToList();

        string[] roles;
        if (userRoles == null || !userRoles.Any())
        {
          roles = new string[] { "User" };
        }
        else
        {
          roles = userRoles.Select(ur => ur.Role?.rolename).ToArray();
        }

        var claim = new Dictionary<string, List<object>>
        {
          {
            "username",
            new List<object> { username }
          },
          {
            "domain",
            new List<object> { domain }
          },
          {
            "user_role",
            new List<object> { string.Join(",", roles) }
          },
          {
            "division",
            new List<object> { division }
          },
          {
            "mail",
            new List<object> { uniqueName }
          },
          {
            "project",
            new List<object> { project }
          },
          {
            "userid",
            new List<object> { userId }
          }
        };

        var (accessToken, refreshToken) = GenerateTokenClass.GenerateTokens(claim, _configuration);

        response.Success = true;
        response.Message = "authentication successful";
        response.Data = new TokenResponse
        {
          AccessToken = accessToken,
          RefreshToken = refreshToken
        };
      }
    }
    catch (Exception ex)
    {
      response.Success = false;
      response.Message = ex.Message.ToString();
    }
    return response;
  }

  private string GenerateToken(
    string uniqueName,
    string localAdDomain,
    string localAdUsername,
    string Division,
    string Project,
    string UserId,
    string[] roles
  )
  {
    var tokenHandler = new JwtSecurityTokenHandler();
    var key = Encoding.UTF8.GetBytes(_configuration["JwtAuthentication:SecretKey"]);

    var tokenDescriptor = new SecurityTokenDescriptor
    {
      Subject = new ClaimsIdentity(
        new Claim[]
        {
          new Claim("domain", localAdDomain.ToString()),
          new Claim("username", localAdUsername.ToString()),
          new Claim("division", Division.ToString()),
          new Claim("mail", uniqueName.ToString()),
          new Claim("project", Project.ToString()),
          new Claim("userid", UserId.ToString()),
          new Claim("user_role", string.Join(",", roles))
        }
      ),

      Expires = DateTime.UtcNow.AddDays(7),
      SigningCredentials = new SigningCredentials(
        new SymmetricSecurityKey(key),
        SecurityAlgorithms.HmacSha256Signature
      )
    };

    var token = tokenHandler.CreateToken(tokenDescriptor);
    var tokenString = tokenHandler.WriteToken(token);
    Console.WriteLine(tokenString);
    return tokenString;
  }

  [HttpPost("changepassword")]
  public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
  {
    var response = await _loginService.ChangePassword(GetUserEmailFromClaims(), request);

    if (response.Success)
    {
      return Ok(response.Message);
    }
    else
    {
      return StatusCode(400, new { error = response.Message });
    }
  }

  [HttpPost("forgotpassword")]
  public async Task<IActionResult> ForgotPassword([FromBody] ForgotPassword model)
  {
    var response = await _loginService.ForgotPassword(model);

    if (response.Success)
    {
      return Ok(response.Message);
    }
    else
    {
      return StatusCode(400, new { error = response.Message });
    }
  }

  [HttpPost]
  [AllowAnonymous]
  [Route("resetpassword")]
  public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest model)
  {
    var response = await _loginService.ResetPassword(model);

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
