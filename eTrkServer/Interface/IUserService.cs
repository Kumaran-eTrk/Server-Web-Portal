using eTrkServer.DTO.RequestDTO;
using eTrkServer.Entity;
using eTrkServer.Utils;

namespace eTrkServer.Interface
{
  public interface IUserService
  {
    Task<BaseResponse<string>> CreateUser(string username, UserDatasPost request);
    Task<BaseResponse<string>> UpdateUser(string Id, string username, UsersDetailsUpdate request);
    Task<BaseResponse<List<UserDataDto>>> GetUser();

    Task<BaseResponse<string>> DeleteUser(string Id);

    Task<BaseResponse<string>> CreateProject(string username, ProjectMaster request);
    Task<BaseResponse<string>> UpdateProject(
      string projectId,
      string username,
      ProjectUpdate request
    );

    Task<BaseResponse<string>> CreateHoliday(string username, Holidays request);

    Task<BaseResponse<string>> UpdateHoliday(string Id, string username, Holidays request);

    Task<BaseResponse<string>> CreateRole(string username, RoleMaster request);

    Task<BaseResponse<IEnumerable<GetRole>>> GetRoles();

    Task<BaseResponse<string>> DeleteRole(int id);

    Task<BaseResponse<string>> UpdateRole(int id, string username, RoleUpdateRequest request);
    Task<BaseResponse<string>> CreateUserRole(string username, UserRoleDetailsRequest request);

    Task<BaseResponse<IEnumerable<UserRoleDto>>> GetUserRole();

    Task<BaseResponse<string>> UpdateUserRole(
      string email,
      string username,
      UserRoleUpdateRequest request
    );

    Task<BaseResponse<string>> DeleteUserRole(int id);
  }
}
