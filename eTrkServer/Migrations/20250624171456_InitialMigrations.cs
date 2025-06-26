using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace UserMonitorAPIServer.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigrations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ApplicationMaster",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    ApplicationName = table.Column<string>(type: "text", nullable: false),
                    AlternativeName = table.Column<string>(type: "text", nullable: false),
                    ModifiedBy = table.Column<string>(type: "text", nullable: true),
                    ModifiedDatetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationMaster", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Holidays",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Holiday = table.Column<string>(type: "text", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Location = table.Column<string>(type: "text", nullable: false),
                    Branch = table.Column<string>(type: "text", nullable: false),
                    ModifiedBy = table.Column<string>(type: "text", nullable: true),
                    ModifiedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Holidays", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "IPAddresses",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    UserName = table.Column<string>(type: "text", nullable: false),
                    IPAddress = table.Column<string>(type: "text", nullable: false),
                    MacAddress = table.Column<string>(type: "text", nullable: false),
                    RecordDateTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    City = table.Column<string>(type: "text", nullable: true),
                    State = table.Column<string>(type: "text", nullable: true),
                    Country = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IPAddresses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MasterExtension",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    version = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MasterExtension", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MasterSoftware",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Version = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MasterSoftware", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductInfo",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Productkey = table.Column<string>(type: "text", nullable: true),
                    Salt = table.Column<byte[]>(type: "bytea", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductInfo", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProjectMaster",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    ProjectName = table.Column<string>(type: "text", nullable: false),
                    ModifiedBy = table.Column<string>(type: "text", nullable: true),
                    ModifiedDatetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectMaster", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RoleMaster",
                columns: table => new
                {
                    role_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    rolename = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    ModifiedBy = table.Column<string>(type: "text", nullable: true),
                    ModifiedDatetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoleMaster", x => x.role_id);
                });

            migrationBuilder.CreateTable(
                name: "UpdaterModels",
                columns: table => new
                {
                    VersionId = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Path = table.Column<string>(type: "text", nullable: true),
                    FromDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UpdaterModels", x => x.VersionId);
                });

            migrationBuilder.CreateTable(
                name: "UserActivities",
                columns: table => new
                {
                    UserName = table.Column<string>(type: "text", nullable: false),
                    DomainName = table.Column<string>(type: "text", nullable: false),
                    CurrentDateTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsSessionLocked = table.Column<bool>(type: "boolean", nullable: true),
                    TotalIdleTime = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserActivities", x => new { x.UserName, x.DomainName, x.CurrentDateTime });
                });

            migrationBuilder.CreateTable(
                name: "UserLoggingActivity",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    UserName = table.Column<string>(type: "text", nullable: true),
                    DomainName = table.Column<string>(type: "text", nullable: true),
                    CurrentDateTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastLogonDateTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastLogoutDateTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserLoggingActivity", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserMetaData",
                columns: table => new
                {
                    UserName = table.Column<string>(type: "text", nullable: false),
                    DomainName = table.Column<string>(type: "text", nullable: false),
                    MachineName = table.Column<string>(type: "text", nullable: false),
                    OSVersion = table.Column<string>(type: "text", nullable: false),
                    OSType = table.Column<string>(type: "text", nullable: false),
                    MachineType = table.Column<string>(type: "text", nullable: true),
                    RecordDateTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserMetaData", x => x.UserName);
                });

            migrationBuilder.CreateTable(
                name: "ExtensionHistory",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    ExtensionID = table.Column<string>(type: "text", nullable: false),
                    updateversion = table.Column<string>(type: "text", nullable: false),
                    remarks = table.Column<string>(type: "text", nullable: false),
                    modifiedbyuser = table.Column<string>(type: "text", nullable: false),
                    modifieddatetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExtensionHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExtensionHistory_MasterExtension_ExtensionID",
                        column: x => x.ExtensionID,
                        principalTable: "MasterExtension",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserExtension",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    ExtensionID = table.Column<string>(type: "text", nullable: false),
                    username = table.Column<string>(type: "text", nullable: false),
                    permissions = table.Column<string>(type: "text", nullable: false),
                    browser = table.Column<string>(type: "text", nullable: false),
                    startdatetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    modifieddatetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserExtension", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserExtension_MasterExtension_ExtensionID",
                        column: x => x.ExtensionID,
                        principalTable: "MasterExtension",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SoftwareHistory",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    SoftwareID = table.Column<string>(type: "text", nullable: false),
                    EditVersion = table.Column<string>(type: "text", nullable: false),
                    Remarks = table.Column<string>(type: "text", nullable: false),
                    ModifiedByUser = table.Column<string>(type: "text", nullable: false),
                    ModifiedDateTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SoftwareHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SoftwareHistory_MasterSoftware_SoftwareID",
                        column: x => x.SoftwareID,
                        principalTable: "MasterSoftware",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserSoftwares",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    SoftwareID = table.Column<string>(type: "text", nullable: false),
                    UserName = table.Column<string>(type: "text", nullable: false),
                    InstalledDate = table.Column<string>(type: "text", nullable: false),
                    ModifiedDateTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSoftwares", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserSoftwares_MasterSoftware_SoftwareID",
                        column: x => x.SoftwareID,
                        principalTable: "MasterSoftware",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectApplications",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    ApplicationId = table.Column<string>(type: "text", nullable: false),
                    ProjectId = table.Column<string>(type: "text", nullable: false),
                    Productive = table.Column<bool>(type: "boolean", nullable: false),
                    ModifiedBy = table.Column<string>(type: "text", nullable: true),
                    ModifiedDatetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectApplications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectApplications_ApplicationMaster_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "ApplicationMaster",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectApplications_ProjectMaster_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "ProjectMaster",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserDatas",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    DisplayName = table.Column<string>(type: "text", nullable: false),
                    ReportingInto = table.Column<string>(type: "text", nullable: false),
                    Division = table.Column<string>(type: "text", nullable: false),
                    Location = table.Column<string>(type: "text", nullable: false),
                    JobTitle = table.Column<string>(type: "text", nullable: false),
                    ReportingIntoMail = table.Column<string>(type: "text", nullable: true),
                    Branch = table.Column<string>(type: "text", nullable: false),
                    ProjectId = table.Column<string>(type: "text", nullable: false),
                    LocalADDomain = table.Column<string>(type: "text", nullable: false),
                    LocalADUserName = table.Column<string>(type: "text", nullable: false),
                    Password = table.Column<string>(type: "text", nullable: true),
                    ModifiedBy = table.Column<string>(type: "text", nullable: true),
                    ModifiedDatetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    isDelete = table.Column<bool>(type: "boolean", nullable: false),
                    VersionId = table.Column<string>(type: "text", nullable: false),
                    ShiftStartTime = table.Column<string>(type: "text", nullable: true),
                    ShiftEndTime = table.Column<string>(type: "text", nullable: true),
                    IsScreenshot = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserDatas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserDatas_ProjectMaster_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "ProjectMaster",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UsersRoles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    useremail = table.Column<string>(type: "text", nullable: false),
                    RoleId = table.Column<int>(type: "integer", nullable: false),
                    ModifiedBy = table.Column<string>(type: "text", nullable: true),
                    ModifiedDatetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsersRoles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UsersRoles_RoleMaster_RoleId",
                        column: x => x.RoleId,
                        principalTable: "RoleMaster",
                        principalColumn: "role_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ActiveApplications",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Application = table.Column<string>(type: "text", nullable: true),
                    ApplicationName = table.Column<string>(type: "text", nullable: true),
                    StartDateTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EndDateTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Screenshot = table.Column<byte[]>(type: "bytea", nullable: true),
                    ScreenshotPath = table.Column<string>(type: "text", nullable: true),
                    RecordDateTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UserActivityUserName = table.Column<string>(type: "text", nullable: false),
                    UserActivityDomainName = table.Column<string>(type: "text", nullable: false),
                    UserActivityCurrentDateTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActiveApplications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ActiveApplications_UserActivities_UserActivityUserName_User~",
                        columns: x => new { x.UserActivityUserName, x.UserActivityDomainName, x.UserActivityCurrentDateTime },
                        principalTable: "UserActivities",
                        principalColumns: new[] { "UserName", "DomainName", "CurrentDateTime" },
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BrowserHistory",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    URL = table.Column<string>(type: "text", nullable: true),
                    Title = table.Column<string>(type: "text", nullable: true),
                    VisitTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    BrowserName = table.Column<string>(type: "text", nullable: true),
                    UserActivityUserName = table.Column<string>(type: "text", nullable: true),
                    UserActivityDomainName = table.Column<string>(type: "text", nullable: true),
                    UserActivityCurrentDateTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BrowserHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BrowserHistory_UserActivities_UserActivityUserName_UserActi~",
                        columns: x => new { x.UserActivityUserName, x.UserActivityDomainName, x.UserActivityCurrentDateTime },
                        principalTable: "UserActivities",
                        principalColumns: new[] { "UserName", "DomainName", "CurrentDateTime" });
                });

            migrationBuilder.CreateIndex(
                name: "IX_ActiveApplications_UserActivityUserName_UserActivityDomainN~",
                table: "ActiveApplications",
                columns: new[] { "UserActivityUserName", "UserActivityDomainName", "UserActivityCurrentDateTime" });

            migrationBuilder.CreateIndex(
                name: "IX_BrowserHistory_UserActivityUserName_UserActivityDomainName_~",
                table: "BrowserHistory",
                columns: new[] { "UserActivityUserName", "UserActivityDomainName", "UserActivityCurrentDateTime" });

            migrationBuilder.CreateIndex(
                name: "IX_ExtensionHistory_ExtensionID",
                table: "ExtensionHistory",
                column: "ExtensionID");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectApplications_ApplicationId",
                table: "ProjectApplications",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectApplications_ProjectId",
                table: "ProjectApplications",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_SoftwareHistory_SoftwareID",
                table: "SoftwareHistory",
                column: "SoftwareID");

            migrationBuilder.CreateIndex(
                name: "IX_UserDatas_ProjectId",
                table: "UserDatas",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_UserExtension_ExtensionID",
                table: "UserExtension",
                column: "ExtensionID");

            migrationBuilder.CreateIndex(
                name: "IX_UserSoftwares_SoftwareID",
                table: "UserSoftwares",
                column: "SoftwareID");

            migrationBuilder.CreateIndex(
                name: "IX_UsersRoles_RoleId",
                table: "UsersRoles",
                column: "RoleId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ActiveApplications");

            migrationBuilder.DropTable(
                name: "BrowserHistory");

            migrationBuilder.DropTable(
                name: "ExtensionHistory");

            migrationBuilder.DropTable(
                name: "Holidays");

            migrationBuilder.DropTable(
                name: "IPAddresses");

            migrationBuilder.DropTable(
                name: "ProductInfo");

            migrationBuilder.DropTable(
                name: "ProjectApplications");

            migrationBuilder.DropTable(
                name: "SoftwareHistory");

            migrationBuilder.DropTable(
                name: "UpdaterModels");

            migrationBuilder.DropTable(
                name: "UserDatas");

            migrationBuilder.DropTable(
                name: "UserExtension");

            migrationBuilder.DropTable(
                name: "UserLoggingActivity");

            migrationBuilder.DropTable(
                name: "UserMetaData");

            migrationBuilder.DropTable(
                name: "UserSoftwares");

            migrationBuilder.DropTable(
                name: "UsersRoles");

            migrationBuilder.DropTable(
                name: "UserActivities");

            migrationBuilder.DropTable(
                name: "ApplicationMaster");

            migrationBuilder.DropTable(
                name: "ProjectMaster");

            migrationBuilder.DropTable(
                name: "MasterExtension");

            migrationBuilder.DropTable(
                name: "MasterSoftware");

            migrationBuilder.DropTable(
                name: "RoleMaster");
        }
    }
}
