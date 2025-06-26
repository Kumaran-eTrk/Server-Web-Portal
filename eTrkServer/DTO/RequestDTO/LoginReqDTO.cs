namespace eTrkServer.DTO.RequestDTO
{
  public class LdapAuthenticationConfig
  {
    public string Path { get; set; }
    public string UserDomainName { get; set; }
  }

  public class LoginRequest
  {
    public string Username { get; set; }
    public string Password { get; set; }
  }

  public class OtpRequest
  {
    public string Email { get; set; }
    public string Otp { get; set; }
  }

  public class RefreshTokenRequest
  {
    public string RefreshToken { get; set; }
  }

  public class TokenRequest
  {
    public string Token { get; set; }
  }

  public class ForgotPassword
  {
    public string Email { get; set; }
  }

  public class ResetPasswordRequest
  {
    public string Email { get; set; }
    public string Token { get; set; }
    public string NewPassword { get; set; }
  }

  public class ChangePasswordRequest
  {
    public string CurrentPassword { get; set; }
    public string NewPassword { get; set; }
    public string ConfirmNewPassword { get; set; }
  }
}
