using Microsoft.AspNetCore.Mvc;

namespace eTrkServer.Controllers
{
  [ApiController]
  public class BaseController : ControllerBase
  {
    private readonly Serilog.ILogger _logger;

    public BaseController(Serilog.ILogger logger)
    {
      _logger = logger;
    }

    public BaseController() { }

    protected string GetUserEmailFromClaims()
    {
      var userEmail = User.FindFirst("mail");
      return userEmail?.Value ?? string.Empty; // Return the email or an empty string if not found
    }

    protected string GetUserNameFromClaims()
    {
      var userName = User.FindFirst("username");
      return userName?.Value ?? string.Empty; // Return the email or an empty string if not found
    }

    protected string GetUserRolesFromClaims()
    {
      var userRolesClaim = User.FindFirst("user_role");
      Console.WriteLine("UserRole :" + userRolesClaim?.Value);
      return userRolesClaim?.Value ?? string.Empty; // Return the roles as a string or an empty string if not found
    }
  }
}
