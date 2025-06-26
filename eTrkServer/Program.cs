using System.Security.Claims;
using System.Text;
using eTrkServer.Configurations;
using eTrkServer.DTO.RequestDTO;
using eTrkServer.DTO.ResponseDTO;
using eTrkServer.Utils;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("appsettings.json");
var configuration = builder.Configuration;

// Add configuration from appsettings and environment variables
builder
  .Configuration.SetBasePath(Directory.GetCurrentDirectory())
  .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
  .AddJsonFile(
    $"appsettings.{builder.Environment.EnvironmentName}.json",
    optional: true,
    reloadOnChange: true
  )
  .AddEnvironmentVariables();

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddScoped<EmailService>();

builder.Services.AddHostedService<ExtensionNotification>();
builder.Services.AddHostedService<NonLoggedNotification>();
builder.Services.AddHostedService<LoggingHoursNotification>();
builder.Services.AddHostedService<ConsolidationHoursNotification>();
builder.Services.AddHostedService<AgentStatusNotification>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.RegisterServices();
builder.Services.AddDbContext<AppDbContext>();
builder.Services.Configure<GlobalConnectionString>(
  builder.Configuration.GetSection("ConnectionStrings")
);
builder.Services.Configure<LdapAuthenticationConfig>(builder.Configuration.GetSection("Ldap"));
builder.Services.Configure<MailSettings>(builder.Configuration.GetSection("Mail"));

builder.Services.AddCors(options =>
{
  options.AddPolicy(
    "AllowReactAppOrigin",
    builder =>
    {
      var corsSettings = configuration.GetSection("CorsSettings");
      var allowedOrigins = corsSettings.GetSection("AllowedOrigins").Get<string[]>();

      builder.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod();
    }
  );
});

builder.Services.AddSwaggerGen(c =>
{
  c.SwaggerDoc("v1", new OpenApiInfo { Title = "UserMonitor", Version = "v1" });

  c.AddSecurityDefinition(
    "Bearer",
    new OpenApiSecurityScheme
    {
      In = ParameterLocation.Header,
      Description = "Please enter the access token in the field",
      Name = "Authorization",
      Type = SecuritySchemeType.ApiKey
    }
  );

  c.AddSecurityRequirement(
    new OpenApiSecurityRequirement
    {
      {
        new OpenApiSecurityScheme
        {
          Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
        },
        Array.Empty<string>()
      }
    }
  );
});

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
  options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
});

var jwtSettings = configuration.GetSection("JwtAuthentication");
var issuer = jwtSettings["Issuer"];
var audience = jwtSettings["Audience"];
var secretKey = jwtSettings["SecretKey"];

builder
  .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
  .AddJwtBearer(options =>
  {
    options.TokenValidationParameters = new TokenValidationParameters
    {
      ValidateIssuer = false,
      ValidateAudience = false,
      ValidateLifetime = true,
      ValidateIssuerSigningKey = true,
      ValidIssuer = issuer,
      ValidAudience = audience,
      IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
    };

    options.Events = new JwtBearerEvents
    {
      OnTokenValidated = context =>
      {
        MapKeycloakRolesToRoleClaims(context);

        return Task.CompletedTask;
      },
    };
  });

void MapKeycloakRolesToRoleClaims(TokenValidatedContext context)
{
  var resourceAccessClaim = context.Principal.FindFirst("user_role");
  if (resourceAccessClaim != null)
  {
    var resourceAccess = resourceAccessClaim.Value;
    var claimsIdentity = context.Principal.Identity as ClaimsIdentity;
    if (claimsIdentity == null)
    {
      return;
    }

    var roles = resourceAccess.Split(',');

    foreach (var role in roles)
    {
      claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, role.Trim()));
    }
  }
}

var logger = new LoggerConfiguration()
  .MinimumLevel.Debug()
  .WriteTo.Console()
  .WriteTo.File(
    Directory.GetCurrentDirectory() + "\\logs\\umlog",
    rollingInterval: RollingInterval.Day
  )
  .CreateLogger();

builder.Host.UseSerilog(logger);
builder.Logging.ClearProviders();
builder.Logging.AddSerilog(logger);
builder
  .Services.AddHealthChecks()
  .AddCheck<DatabaseHealthCheck>("custom-sql", HealthStatus.Unhealthy)
  .AddDbContextCheck<AppDbContext>();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.ApplyMigrations();

app.UseHealthChecks(
  "/api/health",
  new HealthCheckOptions { ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse }
);
app.UseForwardedHeaders(
  new ForwardedHeadersOptions
  {
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
  }
);

app.UseHttpsRedirection();
app.UseCors("AllowReactAppOrigin");

app.UseAuthorization();

app.MapControllers();

app.Run();
