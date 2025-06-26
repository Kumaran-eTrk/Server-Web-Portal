using eTrkServer.DTO.RequestDTO;
using eTrkServer.DTO.ResponseDTO;
using eTrkServer.Entity;
using eTrkServer.Utils;

namespace eTrkServer.Interface
{
  public interface IUserMonitorService
  {
    Task<BaseResponse<string>> GetUserActivity(UserActivity request);

    Task<BaseResponse<string>> GetUserMetaData(UserMetadata request);

    Task<BaseResponse<string>> GetIpAddress(IPAddressInfo request);

    Task<BaseResponse<string>> GetLoggingActivity(UserLoggingActivity request);

    Task<BaseResponse<string>> GetExtensions(ExtensionDTo request);

    Task<BaseResponse<string>> GetSoftwares(Softwareinfo request);

    Task<BaseResponse<string>> AppVersion(AppVersion request);
  }
}
