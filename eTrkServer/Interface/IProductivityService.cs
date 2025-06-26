using eTrkServer.DTO.RequestDTO;
using eTrkServer.Entity;
using eTrkServer.Utils;

namespace eTrkServer.Interface
{
  public interface IProductivityService
  {
    Task<BaseResponse<string>> CreateApplication(string username, ApplicationMaster request);
    Task<BaseResponse<string>> UpdateApplication(
      string Id,
      string username,
      ApplicationUpdate request
    );
    Task<BaseResponse<string>> DeleteApplication(string Id);

    Task<BaseResponse<List<ProjectApplications>>> PostProjectMapping(
      string username,
      ProjectMappingDto request
    );

    Task<BaseResponse<object>> GetProjectMapping(string projectId);

    Task<BaseResponse<string>> UpdateProjectApplication(
      string username,
      UpdateProjectApplicationsRequest request
    );

    Task<BaseResponse<IEnumerable<string>>> GetUnMacthedApplications();
  }
}
