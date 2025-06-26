using System.DirectoryServices.Protocols;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;
using eTrkServer.DTO.RequestDTO;
using eTrkServer.DTO.ResponseDTO;
using eTrkServer.Entity;
using eTrkServer.Helpers;
using eTrkServer.Helpers;
using eTrkServer.Interface;
using eTrkServer.Utils;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace eTrkServer.ServiceImplementation
{
  public class LoginService : ILoginService
  {
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly Serilog.ILogger _logger;
    private readonly EmailService _emailService;
    private readonly HashPassword password;
    private bool useLDAP;
    private readonly Encryption encrypt;

    public LoginService(
      AppDbContext context,
      IConfiguration configuration,
      Serilog.ILogger logger,
      EmailService emailService
    )
    {
      _context = context;
      _emailService = emailService;
      _configuration = configuration;
      encrypt = new Encryption(_configuration);
      password = new HashPassword();
      useLDAP = _configuration.GetValue<bool>("LdapAuthenication:mode");
    }

    public async Task<BaseResponse<string>> ChangePassword(
      string email,
      ChangePasswordRequest request
    )
    {
      BaseResponse<string> response = new BaseResponse<string>();

      if (string.IsNullOrEmpty(email))
      {
        response.Message = "User email could not be retrieved from the token.";
        response.Success = false;
        return response;
      }

      if (request.NewPassword != request.ConfirmNewPassword)
      {
        response.Message = "New password and confirmation password do not match.";
        response.Success = false;
        return response;
      }

      var user = await _context.UserDatas.SingleOrDefaultAsync(u => u.Email == email);

      if (user == null)
      {
        response.Message = "User not found.";
        response.Success = false;
        return response;
      }

      if (user.Password != password.Password(request.CurrentPassword))
      {
        response.Message = "Current password is incorrect.";
        response.Success = false;
        return response;
      }

      try
      {
        user.Password = password.Password(request.NewPassword);
        await _context.SaveChangesAsync();
        response.Message = "Password Changed Successfully";
        response.Success = true;
        return response;
      }
      catch (Exception ex)
      {
        _logger.Debug("Error in ChangePassword: " + ex.Message);
        _logger.Error("Error in ChangePassword: " + ex.StackTrace);
        response.Message = ex.Message.ToString();
        response.Success = false;
        return response;
      }
    }

    public async Task<BaseResponse<ScreenshotConfigurationDTO>> ScreenshotSconfiguration(
      ScreenshotConfiguration request
    )
    {
      BaseResponse<ScreenshotConfigurationDTO> response =
        new BaseResponse<ScreenshotConfigurationDTO>();
      try
      {
        if (string.IsNullOrEmpty(request.UserName) || string.IsNullOrEmpty(request.DomainName))
        {
          response.Success = false;
          response.Message = "Invalid request: Missing required parameters.";
          _logger.Warning(
            "Invalid request detected - missing UserName, DomainName, or MachineName."
          );
          return response;
        }
        var user = await _context
          .UserDatas.Where(x =>
            x.LocalADUserName == request.UserName && x.LocalADDomain == request.DomainName
          )
          .FirstOrDefaultAsync();

        ScreenshotConfigurationDTO result = new ScreenshotConfigurationDTO
        {
          Username = request.UserName,
          Domainname = request.DomainName,
          Screenshot = user.IsScreenshot
        };
        response.Success = true;
        response.Message = "successfully retireved the screenshot configurations";
        response.Data = result;

        return response;
      }
      catch (Exception ex)
      {
        _logger.Error($"Error while getting screenshot configurations: {ex.Message}", ex);
        response.Success = false;
        response.Message = "An error occurred while processing the request.";
        return response;
      }
    }

    public async Task<BaseResponse<string>> ForgotPassword(ForgotPassword request)
    {
      BaseResponse<string> response = new BaseResponse<string>();
      try
      {
        var user = await _context.UserDatas.SingleOrDefaultAsync(u => u.Email == request.Email);
        var time = _configuration.GetValue<int>("ResetEmail:ExpiryMinutes");
        if (user == null)
        {
          response.Message = "User not found";
          response.Success = false;
          return response;
        }
        var token = GenerateTokenClass.GeneratePasswordResetToken(user.Email, _configuration);
        var clientAppUrl = _configuration["ResetPassword:RedirectUrl"];
        var resetLink = $"{clientAppUrl}/resetpassword?&q={token}";

        var emailBody =
          $@"
        <p>Dear {user.DisplayName},</p>
        <p>We received a request to reset the password for your account associated with this email address. If you made this request, please click the link below to reset your password:</p>
        <p><a href='{resetLink}'>Reset Password</a></p>
        <p>If you did not request a password reset, please disregard this email. Your account is still secure, and no changes have been made.</p>
        <p>For security purposes, the link will expire in {time} Minutes. </p>";

        await _emailService.SendEmailAsync(user.Email, "Password Reset", emailBody);
        response.Message = "Email Sent Successfully for Reset Password";
        response.Success = true;
        return response;
      }
      catch (Exception ex)
      {
        response.Message = ex.Message.ToString();
        response.Success = false;
        return response;
      }
    }

    public async Task<BaseResponse<TokenResponse>> Login(LoginRequest req)
    {
      BaseResponse<TokenResponse> response = new BaseResponse<TokenResponse>();
      if (useLDAP)
      {
        // LDAP Authentication

        if (req.Username != null)
        {
          try
          {
            var ldapConfig = _configuration.GetSection("Ldap");
            var ldapPath = ldapConfig["Path"];
            var ldapUserDomainName = ldapConfig["UserDomainName"];
            Console.WriteLine("Ldap User" + ldapUserDomainName);

            var directory = new LdapDirectoryIdentifier(
              ldapPath,
              389,
              fullyQualifiedDnsHostName: false,
              connectionless: false
            );
            var credential = new NetworkCredential("drtest\\" + req.Username, req.Password);
            var ldapConnection = new LdapConnection(directory, credential)
            {
              AuthType = AuthType.Basic
            };

            ldapConnection.SessionOptions.ProtocolVersion = 3;
            ldapConnection.SessionOptions.ReferralChasing = ReferralChasingOptions.None;
            ldapConnection.Timeout = TimeSpan.FromMinutes(1);

            var request = new SearchRequest(
              "CN=Users," + ldapUserDomainName,
              "(&(objectClass=user)(SAMAccountName=" + req.Username + "))",
              SearchScope.Subtree,
              new string[] { "givenName" }
            );

            var result = (SearchResponse)ldapConnection.SendRequest(request);

            if (result.Entries.Count == 0)
            {
              response.Success = false;
              response.Message = "LDAP authentication failed";
              return response;
            }

            Console.WriteLine("Ldap Checking Successfull");
            var item = result.Entries[0];

            var user = _context.UserDatas.FirstOrDefault(u =>
              u.LocalADUserName == req.Username && u.isDelete == false
            );

            if (user != null)
            {
              // Generate claims for LDAP user



              // Additional user information
              string division = user.Division;
              string project = "";
              string userId = user.Id;
              string email = user.Email;
              string domain = user.LocalADDomain;

              var userRoles = _context
                .UsersRoles.Include(ur => ur.Role)
                .Where(ur => ur.useremail == user.Email)
                .ToList();

              if (!string.IsNullOrEmpty(user.ProjectId))
              {
                var userProject = _context.ProjectMaster.FirstOrDefault(p =>
                  p.Id == user.ProjectId
                );
                if (userProject != null)
                {
                  project = userProject.ProjectName;
                }
              }

              string[] roles = new string[] { "User" }; // Default role if userRoles is empty
              if (userRoles.Any())
              {
                roles = userRoles.Select(ur => ur.Role?.rolename).ToArray();
              }

              string rolesString = string.Join(",", roles);
              // Generate claims
              var claims = new Dictionary<string, List<object>>
              {
                {
                  "username",
                  new List<object> { req.Username }
                },
                {
                  "domain",
                  new List<object> { domain }
                },
                {
                  "user_role",
                  new List<object> { rolesString }
                },
                {
                  "division",
                  new List<object> { division }
                },
                {
                  "mail",
                  new List<object> { email }
                },
                {
                  "project",
                  new List<object> { project }
                },
                {
                  "userid",
                  new List<object> { userId }
                }
              };
              var (accessToken, refreshToken) = GenerateTokenClass.GenerateTokens(
                claims,
                _configuration
              );

              response.Success = true;
              response.Message = "authentication successful";
              response.Data = new TokenResponse
              {
                AccessToken = accessToken,
                RefreshToken = refreshToken
              };
              return response;
            }
            else
            {
              response.Success = false;
              response.Message = "Authentication failed";
              return response;
            }
          }
          catch (Exception ex)
          {
            // Log other exceptions for further investigation
            Console.WriteLine($"Unexpected Exception: {ex.Message}");
            response.Success = false;
            response.Message = ex.Message.ToString();
            return response;
          }
        }
        else
        {
          // Invalid LDAP username format
          response.Success = false;
          response.Message = "Invalid UserName format";
          return response;
        }
      }
      // Db Authentication

      else
      {
        var user = _context.UserDatas.FirstOrDefault(u =>
          u.Email == req.Username && u.isDelete == false
        );

        try
        {
          if (user != null)
          {
            // Hash the password stored in db
            string storedPassword = user.Password;

            // normal password provided by the user
            string hashedPassword = password.Password(req.Password);

            // Compare the hashed password with the hashed password stored in the database
            if (storedPassword == hashedPassword)
            {
              // Additional user information
              string username = user.LocalADUserName;
              string division = user.Division;
              string project = "";
              string userId = user.Id;
              string email = user.Email;
              string domain = user.LocalADDomain;
              var userRoles = _context
                .UsersRoles.Include(ur => ur.Role)
                .Where(ur => ur.useremail == user.Email)
                .ToList();

              if (!string.IsNullOrEmpty(user.ProjectId))
              {
                var userProject = _context.ProjectMaster.FirstOrDefault(p =>
                  p.Id == user.ProjectId
                );
                if (userProject != null)
                {
                  project = userProject.ProjectName;
                }
              }

              string[] roles = new string[] { "User" }; // Default role if userRoles is empty
              if (userRoles.Any())
              {
                roles = userRoles.Select(ur => ur.Role?.rolename).ToArray();
              }

              string rolesString = string.Join(",", roles);

              var claims = new Dictionary<string, List<object>>
              {
                {
                  "username",
                  new List<object> { username }
                },
                {
                  "domain",
                  new List<object> { domain }
                },
                {
                  "user_role",
                  new List<object> { rolesString }
                },
                {
                  "division",
                  new List<object> { division }
                },
                {
                  "mail",
                  new List<object> { email }
                },
                {
                  "project",
                  new List<object> { project }
                },
                {
                  "userid",
                  new List<object> { userId }
                }
              };

              var (accessToken, refreshToken) = GenerateTokenClass.GenerateTokens(
                claims,
                _configuration
              );

              response.Success = true;
              response.Message = "authentication successful";
              response.Data = new TokenResponse
              {
                AccessToken = accessToken,
                RefreshToken = refreshToken
              };
            }
          }

          return response;
        }
        catch (Exception ex)
        {
          _logger.Debug("Unexpected Exception: " + ex.StackTrace);
          response.Success = false;
          response.Message = ex.Message.ToString();
          return response;
        }
      }
    }

    public Task<BaseResponse<string>> RefreshToken(RefreshTokenRequest request)
    {
      BaseResponse<string> response = new BaseResponse<string>();
      var tokenHandler = new JwtSecurityTokenHandler();

      try
      {
        var refreshKey = Encoding.UTF8.GetBytes(_configuration["JwtAuthentication:SecretKey"]);
        tokenHandler.ValidateToken(
          request.RefreshToken,
          new TokenValidationParameters
          {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(refreshKey),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
          },
          out SecurityToken validatedToken
        );

        var validatedTokenDescriptor = (JwtSecurityToken)validatedToken;

        // Check if the access token has expired
        var accessTokenExpiration = validatedTokenDescriptor.ValidTo;

        if (accessTokenExpiration < DateTime.UtcNow)
        {
          // Access token has expired
          response.Message = "Access Token has expired";
          response.Success = false;
          return Task.FromResult(response);
        }

        // You can extract claims and perform necessary checks here
        var claims = validatedTokenDescriptor.Claims.ToDictionary(
          c => c.Type,
          c => new List<object> { c.Value }
        );

        // If everything is valid, generate a new access token
        var (newAccessToken, _) = GenerateTokenClass.GenerateTokens(claims, _configuration);
        response.Message = "Access Token Generated";
        response.Success = true;
        response.Data = newAccessToken;
        return Task.FromResult(response);
      }
      catch (Exception ex)
      {
        response.Message = ex.Message.ToString();
        response.Success = false;
        return Task.FromResult(response);
      }
    }

    public async Task<BaseResponse<string>> ResetPassword(ResetPasswordRequest request)
    {
      BaseResponse<string> response = new BaseResponse<string>();
      try
      {
        var tokenHandler = new JwtSecurityTokenHandler();

        var refreshKey = Encoding.UTF8.GetBytes(_configuration["JwtAuthentication:SecretKey"]);
        tokenHandler.ValidateToken(
          request.Token,
          new TokenValidationParameters
          {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(refreshKey),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
          },
          out SecurityToken validatedToken
        );

        var validatedTokenDescriptor = (JwtSecurityToken)validatedToken;

        // Check if the access token has expired
        var accessTokenExpiration = validatedTokenDescriptor.ValidTo.ToLocalTime();

        if (accessTokenExpiration < DateTime.Now)
        {
          // Access token has expired
          response.Message = "Access Token has expired";
          response.Success = false;
          return response;
        }

        // Hash the new password
        var hashedPassword = password.Password(request.NewPassword);

        // Update the user's password in your UserData table
        var userData = await _context.UserDatas.SingleOrDefaultAsync(u => u.Email == request.Email);
        if (userData != null)
        {
          userData.Password = hashedPassword; // Assuming your UserData table has a Password property
          await _context.SaveChangesAsync();
        }
        response.Success = true;
        response.Message = "Password reset successfully";
        return response;
      }
      catch (Exception ex)
      {
        _logger.Debug("Token is expired" + ex.Message);
        response.Message = ex.Message.ToString();
        response.Success = false;
        return response;
      }
    }

    public async Task<BaseResponse<string>> GetAgentToken(AgentToken request)
    {
      BaseResponse<string> response = new BaseResponse<string>();
      try
      {
        byte[] bytes = Convert.FromBase64String(request.productkey);
        string normal = Encoding.UTF8.GetString(bytes);

        //  byte[] saltBytes = GenerateSalt(normal);
        var hash = await _context.ProductInfo.FirstAsync();

        var userInput = encrypt.Encrypt(normal, hash.Salt);
        Console.WriteLine(
          (userInput == hash.Productkey) + "Hash Password from DB :  " + hash.Productkey
        );

        if (userInput == hash.Productkey)
        {
          var claims = new Dictionary<string, List<object>>
          {
            {
              "user_role",
              new List<object> { request.role }
            },
          };

          var Token = GenerateTokenClass.GenerateAgentToken(claims, _configuration);
          Console.WriteLine(" agent token : " + Token);
          response.Message = "Token Generated";
          response.Success = true;
          response.Data = Token;
          return response;
        }
        else
        {
          response.Message = "Authentication failed";
          response.Success = false;
          return response;
        }
      }
      catch (Exception ex)
      {
        _logger.Debug("Error in generating agent token : " + ex.Message);
        response.Message = ex.Message.ToString();
        response.Success = false;
        return response;
      }
    }

    public async Task<BaseResponse<projectkeyresponse>> GetProductInfo()
    {
      BaseResponse<projectkeyresponse> response = new BaseResponse<projectkeyresponse>();
      try
      {
        var info = await _context.ProductInfo.FirstOrDefaultAsync(); // Use FirstOrDefaultAsync to handle empty results
        if (info == null)
        {
          response.Message = "Information not Found";
          return response;
        }

        var decryptpassword = encrypt.Decrypt(info.Productkey, info.Salt);
        string base64Id = Convert.ToBase64String(Encoding.UTF8.GetBytes(decryptpassword));

        var productinfo = new projectkeyresponse
        {
          Id = info.Id,
          productkey = base64Id,
          description = info.Description,
        };
        response.Message = "Product Info Retrieved Successfully";
        response.Success = true;
        response.Data = productinfo;
        return response;
      }
      catch (Exception ex)
      {
        _logger.Debug("Error in getting product key : " + ex.InnerException);
        response.Message = ex.Message.ToString();
        response.Success = false;
        return response;
      }
    }

    public async Task<BaseResponse<string>> GetProductKey()
    {
      BaseResponse<string> response = new BaseResponse<string>();
      try
      {
        var info = _context.ProductInfo.FirstOrDefault();

        if (info == null)
        {
          string Id = Guid.NewGuid().ToString();
          byte[] Salt = encrypt.GenerateSalt(Id);
          string HashPassword = encrypt.Encrypt(Id, Salt);
          string Description = "Kumaran Systems Private Limited..";
          var data = new ProductInfo
          {
            Id = Id,
            Salt = Salt,
            Productkey = HashPassword,
            Description = Description
          };
          _context.ProductInfo.Add(data);

          await _context.SaveChangesAsync();
          var decryptpassword = encrypt.Decrypt(HashPassword, Salt);
          Console.WriteLine("decrypt : " + decryptpassword);
          string base64Id = Convert.ToBase64String(Encoding.UTF8.GetBytes(decryptpassword));
          response.Data = base64Id;
          response.Message = "ProductKey Generated";
          response.Success = true;
          return response;
        }
        else
        {
          var decryptpassword = encrypt.Decrypt(info.Productkey, info.Salt);
          string base64Id = Convert.ToBase64String(Encoding.UTF8.GetBytes(decryptpassword));
          response.Data = base64Id;
          response.Message = "ProductKey Generated";
          response.Success = true;
          return response;
        }
      }
      catch (Exception ex)
      {
        _logger.Debug("Error in generating productkey : " + ex.Message);

        response.Message = ex.Message.ToString();
        response.Success = false;
        return response;
      }
    }
  }
}
