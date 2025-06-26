using eTrkServer.DTO.RequestDTO;
using eTrkServer.DTO.ResponseDTO;
using eTrkServer.Entity;
using eTrkServer.Utils;

namespace eTrkServer.Interface
{
  public interface ISoftwareService
  {
    Task<BaseResponse<string>> CreateSoftwareAsync(SoftwarePostDto softwarePostDto);

    Task<BaseResponse<string>> UpdateSoftwareAsync(
      string softwareId,
      string username,
      SoftwareStatusUpdateDto request
    );

    Task<BaseResponse<List<GetSoftwares>>> GetUnknownSoftwareAsync();
    Task<BaseResponse<List<GetSoftwares>>> GetAcceptedSoftwareAsync();
    Task<BaseResponse<List<GetSoftwares>>> GetRejectedSoftwareAsync();

    Task<BaseResponse<List<RejectedSoftwareDto>>> GetRejectedUsage();

    Task<BaseResponse<List<SoftwareHistory>>> GetHistoryBySoftwareId(string softwareId);
  }
}
