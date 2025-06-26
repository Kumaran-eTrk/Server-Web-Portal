using eTrkServer.DTO.RequestDTO;
using eTrkServer.DTO.ResponseDTO;
using eTrkServer.Utils;

namespace eTrkServer.Interface
{
  public interface IDashboardService
  {
    Task<(IEnumerable<WorkSummary> dateWiseMetrics, TotalHoursSummary totalHours)> GetWorkSummary(
      WorkSummaryRequest request,
      string division,
      string project
    );
    Task<BaseResponse<IEnumerable<object>>> GetWorkSummaryGraph(
      WorkSummaryRequest request,
      string division,
      string project
    );
    Task<BaseResponse<IEnumerable<IpAddressResponse>>> GetIpAddress(
      IPAddressRequest request,
      string division,
      string project
    );

    Task<BaseResponse<IEnumerable<object>>> GetUserApplicationUsage(
      ApplicationUsageRequest request,
      string division,
      string project
    );

    Task<BaseResponse<IEnumerable<ApplicationUsageResponse>>> GetApplicationUsage(
      ApplicationUsageRequest request,
      string division,
      string project
    );
  }
}
