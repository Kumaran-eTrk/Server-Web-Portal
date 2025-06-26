using eTrkServer.DTO.RequestDTO;
using eTrkServer.DTO.ResponseDTO;
using eTrkServer.Utils;

namespace eTrkServer.Interface
{
  public interface ILoginService
  {
    Task<BaseResponse<TokenResponse>> Login(LoginRequest request);

    Task<BaseResponse<string>> RefreshToken(RefreshTokenRequest request);

    Task<BaseResponse<string>> ChangePassword(string email, ChangePasswordRequest request);

    Task<BaseResponse<string>> ForgotPassword(ForgotPassword request);

    Task<BaseResponse<string>> ResetPassword(ResetPasswordRequest request);

    Task<BaseResponse<string>> GetProductKey();

    Task<BaseResponse<string>> GetAgentToken(AgentToken request);
    Task<BaseResponse<ScreenshotConfigurationDTO>> ScreenshotSconfiguration(
      ScreenshotConfiguration request
    );

    Task<BaseResponse<projectkeyresponse>> GetProductInfo();
  }
}
