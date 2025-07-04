﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace UserMonitorAPIServer.Migrations
{
    [DbContext(typeof(AppDbContext))]
    partial class AppDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.4")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("eTrkServer.Entity.ApplicationMaster", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<string>("AlternativeName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("ApplicationName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("ModifiedBy")
                        .HasColumnType("text");

                    b.Property<DateTime?>("ModifiedDatetime")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("Id");

                    b.ToTable("ApplicationMaster");
                });

            modelBuilder.Entity("eTrkServer.Entity.ApplicationUsage", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<string>("Application")
                        .HasColumnType("text");

                    b.Property<string>("ApplicationName")
                        .HasColumnType("text");

                    b.Property<DateTime?>("EndDateTime")
                        .HasColumnType("timestamp with time zone");

                    b.Property<DateTime?>("RecordDateTime")
                        .HasColumnType("timestamp with time zone");

                    b.Property<byte[]>("Screenshot")
                        .HasColumnType("bytea");

                    b.Property<string>("ScreenshotPath")
                        .HasColumnType("text");

                    b.Property<DateTime?>("StartDateTime")
                        .HasColumnType("timestamp with time zone");

                    b.Property<DateTime>("UserActivityCurrentDateTime")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("UserActivityDomainName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("UserActivityUserName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("UserActivityUserName", "UserActivityDomainName", "UserActivityCurrentDateTime");

                    b.ToTable("ActiveApplications");
                });

            modelBuilder.Entity("eTrkServer.Entity.BrowserHistory", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<string>("BrowserName")
                        .HasColumnType("text");

                    b.Property<string>("Title")
                        .HasColumnType("text");

                    b.Property<string>("URL")
                        .HasColumnType("text");

                    b.Property<DateTime?>("UserActivityCurrentDateTime")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("UserActivityDomainName")
                        .HasColumnType("text");

                    b.Property<string>("UserActivityUserName")
                        .HasColumnType("text");

                    b.Property<DateTime?>("VisitTime")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("Id");

                    b.HasIndex("UserActivityUserName", "UserActivityDomainName", "UserActivityCurrentDateTime");

                    b.ToTable("BrowserHistory");
                });

            modelBuilder.Entity("eTrkServer.Entity.Extension", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<int>("Status")
                        .HasColumnType("integer");

                    b.Property<string>("name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("version")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("MasterExtension");
                });

            modelBuilder.Entity("eTrkServer.Entity.History", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<string>("ExtensionID")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("modifiedbyuser")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime>("modifieddatetime")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("remarks")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("updateversion")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("ExtensionID");

                    b.ToTable("ExtensionHistory");
                });

            modelBuilder.Entity("eTrkServer.Entity.Holidays", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<string>("Branch")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime>("Date")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Holiday")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Location")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("ModifiedBy")
                        .HasColumnType("text");

                    b.Property<DateTime?>("ModifiedTime")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("Id");

                    b.ToTable("Holidays");
                });

            modelBuilder.Entity("eTrkServer.Entity.IPAddressInfo", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<string>("City")
                        .HasColumnType("text");

                    b.Property<string>("Country")
                        .HasColumnType("text");

                    b.Property<string>("IPAddress")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("MacAddress")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime>("RecordDateTime")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("State")
                        .HasColumnType("text");

                    b.Property<string>("UserName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("IPAddresses");
                });

            modelBuilder.Entity("eTrkServer.Entity.ProductInfo", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<string>("Description")
                        .HasColumnType("text");

                    b.Property<string>("Productkey")
                        .HasColumnType("text");

                    b.Property<byte[]>("Salt")
                        .HasColumnType("bytea");

                    b.HasKey("Id");

                    b.ToTable("ProductInfo");
                });

            modelBuilder.Entity("eTrkServer.Entity.ProjectApplications", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<string>("ApplicationId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("ModifiedBy")
                        .HasColumnType("text");

                    b.Property<DateTime>("ModifiedDatetime")
                        .HasColumnType("timestamp with time zone");

                    b.Property<bool>("Productive")
                        .HasColumnType("boolean");

                    b.Property<string>("ProjectId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("ApplicationId");

                    b.HasIndex("ProjectId");

                    b.ToTable("ProjectApplications");
                });

            modelBuilder.Entity("eTrkServer.Entity.ProjectMaster", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<string>("ModifiedBy")
                        .HasColumnType("text");

                    b.Property<DateTime?>("ModifiedDatetime")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("ProjectName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("ProjectMaster");
                });

            modelBuilder.Entity("eTrkServer.Entity.RoleMaster", b =>
                {
                    b.Property<int>("role_id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("role_id"));

                    b.Property<string>("ModifiedBy")
                        .HasColumnType("text");

                    b.Property<DateTime?>("ModifiedDatetime")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("description")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("rolename")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("role_id");

                    b.ToTable("RoleMaster");
                });

            modelBuilder.Entity("eTrkServer.Entity.Software", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("Status")
                        .HasColumnType("integer");

                    b.Property<string>("Version")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("MasterSoftware");
                });

            modelBuilder.Entity("eTrkServer.Entity.SoftwareHistory", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<string>("EditVersion")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("ModifiedByUser")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime>("ModifiedDateTime")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Remarks")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("SoftwareID")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("SoftwareID");

                    b.ToTable("SoftwareHistory");
                });

            modelBuilder.Entity("eTrkServer.Entity.UserActivity", b =>
                {
                    b.Property<string>("UserName")
                        .HasColumnType("text");

                    b.Property<string>("DomainName")
                        .HasColumnType("text");

                    b.Property<DateTime>("CurrentDateTime")
                        .HasColumnType("timestamp with time zone");

                    b.Property<bool?>("IsSessionLocked")
                        .HasColumnType("boolean");

                    b.Property<long>("TotalIdleTime")
                        .HasColumnType("bigint");

                    b.HasKey("UserName", "DomainName", "CurrentDateTime");

                    b.ToTable("UserActivities");
                });

            modelBuilder.Entity("eTrkServer.Entity.UserData", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<string>("Branch")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("DisplayName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Division")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<bool>("IsScreenshot")
                        .HasColumnType("boolean");

                    b.Property<string>("JobTitle")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("LocalADDomain")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("LocalADUserName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Location")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("ModifiedBy")
                        .HasColumnType("text");

                    b.Property<DateTime?>("ModifiedDatetime")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Password")
                        .HasColumnType("text");

                    b.Property<string>("ProjectId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("ReportingInto")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("ReportingIntoMail")
                        .HasColumnType("text");

                    b.Property<string>("ShiftEndTime")
                        .HasColumnType("text");

                    b.Property<string>("ShiftStartTime")
                        .HasColumnType("text");

                    b.Property<string>("VersionId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<bool>("isDelete")
                        .HasColumnType("boolean");

                    b.HasKey("Id");

                    b.HasIndex("ProjectId");

                    b.ToTable("UserDatas");
                });

            modelBuilder.Entity("eTrkServer.Entity.UserExtension", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<string>("ExtensionID")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("browser")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime>("modifieddatetime")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("permissions")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime>("startdatetime")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("username")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("ExtensionID");

                    b.ToTable("UserExtension");
                });

            modelBuilder.Entity("eTrkServer.Entity.UserLoggingActivity", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<DateTime?>("CurrentDateTime")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("DomainName")
                        .HasColumnType("text");

                    b.Property<DateTime?>("LastLogonDateTime")
                        .HasColumnType("timestamp with time zone");

                    b.Property<DateTime?>("LastLogoutDateTime")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("UserName")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("UserLoggingActivity");
                });

            modelBuilder.Entity("eTrkServer.Entity.UserMetadata", b =>
                {
                    b.Property<string>("UserName")
                        .HasColumnType("text");

                    b.Property<string>("DomainName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("MachineName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("MachineType")
                        .HasColumnType("text");

                    b.Property<string>("OSType")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("OSVersion")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime>("RecordDateTime")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("UserName");

                    b.ToTable("UserMetaData");
                });

            modelBuilder.Entity("eTrkServer.Entity.UserSoftwares", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<string>("InstalledDate")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime>("ModifiedDateTime")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("SoftwareID")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("UserName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("SoftwareID");

                    b.ToTable("UserSoftwares");
                });

            modelBuilder.Entity("eTrkServer.Entity.UsersRoles", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("ModifiedBy")
                        .HasColumnType("text");

                    b.Property<DateTime?>("ModifiedDatetime")
                        .HasColumnType("timestamp with time zone");

                    b.Property<int>("RoleId")
                        .HasColumnType("integer");

                    b.Property<string>("useremail")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("RoleId");

                    b.ToTable("UsersRoles");
                });

            modelBuilder.Entity("eTrkServer.Model.UpdaterModel", b =>
                {
                    b.Property<string>("VersionId")
                        .HasColumnType("text");

                    b.Property<string>("Description")
                        .HasColumnType("text");

                    b.Property<DateTime>("FromDate")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Path")
                        .HasColumnType("text");

                    b.HasKey("VersionId");

                    b.ToTable("UpdaterModels");
                });

            modelBuilder.Entity("eTrkServer.Entity.ApplicationUsage", b =>
                {
                    b.HasOne("eTrkServer.Entity.UserActivity", "UserActivity")
                        .WithMany("ActiveApplications")
                        .HasForeignKey("UserActivityUserName", "UserActivityDomainName", "UserActivityCurrentDateTime")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("UserActivity");
                });

            modelBuilder.Entity("eTrkServer.Entity.BrowserHistory", b =>
                {
                    b.HasOne("eTrkServer.Entity.UserActivity", "UserActivity")
                        .WithMany("BrowserHistory")
                        .HasForeignKey("UserActivityUserName", "UserActivityDomainName", "UserActivityCurrentDateTime");

                    b.Navigation("UserActivity");
                });

            modelBuilder.Entity("eTrkServer.Entity.History", b =>
                {
                    b.HasOne("eTrkServer.Entity.Extension", "Extension")
                        .WithMany()
                        .HasForeignKey("ExtensionID")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Extension");
                });

            modelBuilder.Entity("eTrkServer.Entity.ProjectApplications", b =>
                {
                    b.HasOne("eTrkServer.Entity.ApplicationMaster", "App")
                        .WithMany()
                        .HasForeignKey("ApplicationId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("eTrkServer.Entity.ProjectMaster", "Project")
                        .WithMany()
                        .HasForeignKey("ProjectId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("App");

                    b.Navigation("Project");
                });

            modelBuilder.Entity("eTrkServer.Entity.SoftwareHistory", b =>
                {
                    b.HasOne("eTrkServer.Entity.Software", "Software")
                        .WithMany()
                        .HasForeignKey("SoftwareID")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Software");
                });

            modelBuilder.Entity("eTrkServer.Entity.UserData", b =>
                {
                    b.HasOne("eTrkServer.Entity.ProjectMaster", "Project")
                        .WithMany()
                        .HasForeignKey("ProjectId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Project");
                });

            modelBuilder.Entity("eTrkServer.Entity.UserExtension", b =>
                {
                    b.HasOne("eTrkServer.Entity.Extension", "Extension")
                        .WithMany("UserExtensions")
                        .HasForeignKey("ExtensionID")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Extension");
                });

            modelBuilder.Entity("eTrkServer.Entity.UserSoftwares", b =>
                {
                    b.HasOne("eTrkServer.Entity.Software", "Software")
                        .WithMany("UserSoftwares")
                        .HasForeignKey("SoftwareID")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Software");
                });

            modelBuilder.Entity("eTrkServer.Entity.UsersRoles", b =>
                {
                    b.HasOne("eTrkServer.Entity.RoleMaster", "Role")
                        .WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Role");
                });

            modelBuilder.Entity("eTrkServer.Entity.Extension", b =>
                {
                    b.Navigation("UserExtensions");
                });

            modelBuilder.Entity("eTrkServer.Entity.Software", b =>
                {
                    b.Navigation("UserSoftwares");
                });

            modelBuilder.Entity("eTrkServer.Entity.UserActivity", b =>
                {
                    b.Navigation("ActiveApplications");

                    b.Navigation("BrowserHistory");
                });
#pragma warning restore 612, 618
        }
    }
}
