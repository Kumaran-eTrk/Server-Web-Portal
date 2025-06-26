using eTrkServer.DTO.RequestDTO;
using eTrkServer.DTO.ResponseDTO;
using eTrkServer.Utils;

namespace eTrkServer.Interface
{
  public interface IAdminService
  {
    Task<BaseResponse<IEnumerable<AgentStatus>>> GetAgentStatus();
    Task<BaseResponse<IEnumerable<AverageHoursDTO>>> GetAverageHours(AverageHours request);

    Task<BaseResponse<FilterResponse>> GetFilterData(
      FilterDataRequest request,
      string email,
      string userrole
    );

    Task<BaseResponse<List<UserDetails>>> GetALlUsers(string email, string userrole);
    Task<BaseResponse<IEnumerable<object>>> GetUserRecording(
      string email,
      DateTime fromDate,
      DateTime toDate
    );

    Task<(
      IEnumerable<HolidayWorkSummary> dateWiseMetrics,
      TotalHoursSummary totalHours
    )> GetHolidayWorkSummary(HolidayWorkSummaryRequest request, string division, string project);

    Task<BaseResponse<List<UserComparisionDTO>>> GetUserComparision(UserComparison request);
    Task<BaseResponse<IEnumerable<WorkingPatternDTO>>> GetWorkingPattern(
      WorkingPattern request,
      string email
    );
    Task<BaseResponse<IEnumerable<LoginStatusDTO>>> GetLoginStatus(
      LoginStatus request,
      string email,
      string userrole
    );
  }
}
