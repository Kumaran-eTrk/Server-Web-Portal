using eTrkServer.DTO.RequestDTO;
using eTrkServer.Entity;
using eTrkServer.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

public class AppDbContext : DbContext
{
  private readonly GlobalConnectionString _options;

  private string connection;
  public DbSet<UserMetadata> UserMetaData { get; set; }
  public DbSet<UserActivity> UserActivities { get; set; }
  public DbSet<ApplicationUsage> ActiveApplications { get; set; }
  public DbSet<BrowserHistory> BrowserHistory { get; set; }

  public DbSet<IPAddressInfo> IPAddresses { get; set; }

  public DbSet<UserLoggingActivity> UserLoggingActivity { get; set; }

  public DbSet<UpdaterModel> UpdaterModels { get; set; }

  public DbSet<UserData> UserDatas { get; set; }

  public DbSet<ProductInfo> ProductInfo { get; set; }

  public DbSet<RoleMaster> RoleMaster { get; set; }
  public DbSet<UsersRoles> UsersRoles { get; set; }

  public DbSet<ApplicationMaster> ApplicationMaster { get; set; }

  public DbSet<ProjectApplications> ProjectApplications { get; set; }

  public DbSet<ProjectMaster> ProjectMaster { get; set; }

  public DbSet<Holidays> Holidays { get; set; }

  //Extensions

  public DbSet<Extension> MasterExtension { get; set; }

  public DbSet<UserExtension> UserExtension { get; set; }

  public DbSet<History> ExtensionHistory { get; set; }

  // Softwares
  public DbSet<Software> MasterSoftware { get; set; }

  public DbSet<UserSoftwares> UserSoftwares { get; set; }

  public DbSet<SoftwareHistory> SoftwareHistory { get; set; }

  public AppDbContext(
    DbContextOptions<AppDbContext> options,
    IOptions<GlobalConnectionString> option
  )
    : base(options)
  {
    _options = option.Value;
    connection = _options.DefaultConnection;
  }

  protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
  {
    optionsBuilder.UseNpgsql(connection);
  }

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    base.OnModelCreating(modelBuilder);
    modelBuilder
      .Entity<ApplicationUsage>()
      .HasOne(au => au.UserActivity) // ApplicationUsage has one UserActivity
      .WithMany(ua => ua.ActiveApplications) // UserActivity has many ApplicationUsages
      .HasForeignKey(au => new
      {
        au.UserActivityUserName,
        au.UserActivityDomainName,
        au.UserActivityCurrentDateTime
      }); // Foreign key property
    modelBuilder
      .Entity<UserActivity>()
      .HasKey(x => new
      {
        x.UserName,
        x.DomainName,
        x.CurrentDateTime
      });

    modelBuilder
      .Entity<UsersRoles>()
      .HasOne(ur => ur.Role)
      .WithMany()
      .HasForeignKey(ur => ur.RoleId);

    modelBuilder
      .Entity<UserData>()
      .HasOne(pa => pa.Project)
      .WithMany()
      .HasForeignKey(pa => pa.ProjectId);

    modelBuilder
      .Entity<ProjectApplications>()
      .HasOne(pa => pa.App)
      .WithMany()
      .HasForeignKey(pa => pa.ApplicationId);

    modelBuilder
      .Entity<ProjectApplications>()
      .HasOne(pa => pa.Project)
      .WithMany()
      .HasForeignKey(pa => pa.ProjectId);

    modelBuilder.Entity<ProjectMaster>().HasKey(p => p.Id);

    modelBuilder.Entity<ApplicationMaster>().HasKey(p => p.Id);
  }
}
