using eTrkServer.Interface;
using eTrkServer.ServiceImplementation;

namespace eTrkServer.Configurations
{
  public static class Configurations
  {
    public static void RegisterServices(this IServiceCollection services)
    {
      services.AddScoped<IAdminService, AdminService>();
      services.AddScoped<IDashboardService, DashboardService>();
      services.AddScoped<IExtensionService, ExtensionService>();
      services.AddScoped<ISoftwareService, SoftwareService>();
      services.AddScoped<ILoginService, LoginService>();
      services.AddScoped<IUserService, UserService>();
      services.AddScoped<IProductivityService, ProductivityService>();
      services.AddScoped<IUserMonitorService, UserMonitorService>();
    }
  }
}
