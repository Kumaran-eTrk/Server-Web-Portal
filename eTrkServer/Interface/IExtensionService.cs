using eTrkServer.DTO.RequestDTO;
using eTrkServer.DTO.ResponseDTO;
using eTrkServer.Entity;
using eTrkServer.Utils;

namespace eTrkServer.Interface
{
  public interface IExtensionService
  {
    Task<BaseResponse<string>> CreateExtensionAsync(ExtensionPost extensionPostDto);

    Task<BaseResponse<string>> UpdateExtensionAsync(
      string extensionId,
      string username,
      ExtensionStatusUpdateDto request
    );

    Task<BaseResponse<List<GetExtensions>>> GetUnknownExtensionAsync();
    Task<BaseResponse<List<GetExtensions>>> GetAcceptedExtensionAsync();
    Task<BaseResponse<List<GetExtensions>>> GetRejectedExtensionAsync();

    Task<BaseResponse<List<RejectedExtensionDto>>> GetRejectedUsage();

    Task<BaseResponse<List<History>>> GetHistoryByExtensionId(string extensionId);
  }
}
