using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace eTrkServer.Helpers
{
  public static class GenerateTokenClass
  {
    public static string GenerateAgentToken(
      Dictionary<string, List<object>> claims,
      IConfiguration configuration
    )
    {
      var tokenHandler = new JwtSecurityTokenHandler();

      // Access token
      var accessKey = Encoding.UTF8.GetBytes(configuration["JwtAuthentication:SecretKey"]);
      var accessTokenDescriptor = new SecurityTokenDescriptor
      {
        Subject = new ClaimsIdentity(), // Create an empty ClaimsIdentity
        Expires = DateTime.UtcNow.AddDays(1), // access token validation
        SigningCredentials = new SigningCredentials(
          new SymmetricSecurityKey(accessKey),
          SecurityAlgorithms.HmacSha256Signature
        )
      };

      foreach (var kvp in claims)
      {
        accessTokenDescriptor.Subject.AddClaim(
          new Claim(kvp.Key, kvp.Value[0].ToString(), ClaimValueTypes.Boolean)
        );
      }
      var accessToken = tokenHandler.CreateToken(accessTokenDescriptor);

      // Encode tokens
      var encodedAccessToken = tokenHandler.WriteToken(accessToken);

      return encodedAccessToken;
    }

    public static (string accessToken, string refreshToken) GenerateTokens(
      Dictionary<string, List<object>> claims,
      IConfiguration configuration
    )
    {
      var tokenHandler = new JwtSecurityTokenHandler();

      // Access token
      var accessKey = Encoding.UTF8.GetBytes(configuration["JwtAuthentication:SecretKey"]);
      var accessTokenDescriptor = new SecurityTokenDescriptor
      {
        Subject = new ClaimsIdentity(), // Create an empty ClaimsIdentity
        Expires = DateTime.UtcNow.AddMinutes(180), // Set a shorter expiration for access token (1 minute)
        SigningCredentials = new SigningCredentials(
          new SymmetricSecurityKey(accessKey),
          SecurityAlgorithms.HmacSha256Signature
        )
      };

      // Refresh token
      var refreshKey = Encoding.UTF8.GetBytes(configuration["JwtAuthentication:SecretKey"]);
      var refreshTokenDescriptor = new SecurityTokenDescriptor
      {
        Subject = new ClaimsIdentity(), // Create an empty ClaimsIdentity
        Expires = DateTime.UtcNow.AddDays(1), // Set a longer expiration for refresh token
        SigningCredentials = new SigningCredentials(
          new SymmetricSecurityKey(refreshKey),
          SecurityAlgorithms.HmacSha256Signature
        )
      };

      // Add claims to both tokens
      foreach (var kvp in claims)
      {
        accessTokenDescriptor.Subject.AddClaim(
          new Claim(kvp.Key, kvp.Value[0].ToString(), ClaimValueTypes.Boolean)
        );
        refreshTokenDescriptor.Subject.AddClaim(
          new Claim(kvp.Key, kvp.Value[0].ToString(), ClaimValueTypes.Boolean)
        );
      }
      var accessToken = tokenHandler.CreateToken(accessTokenDescriptor);
      var refreshToken = tokenHandler.CreateToken(refreshTokenDescriptor);

      // Encode tokens
      var encodedAccessToken = tokenHandler.WriteToken(accessToken);
      var encodedRefreshToken = tokenHandler.WriteToken(refreshToken);

      return (encodedAccessToken, encodedRefreshToken);
    }

    public static string GeneratePasswordResetToken(string useremail, IConfiguration configuration)
    {
      var tokenHandler = new JwtSecurityTokenHandler();
      var key = Encoding.UTF8.GetBytes(configuration["JwtAuthentication:SecretKey"]);
      var time = configuration.GetValue<int>("ResetEmail:ExpiryMinutes");
      var tokenDescriptor = new SecurityTokenDescriptor
      {
        Subject = new ClaimsIdentity(new Claim[] { new Claim("mail", useremail.ToString()), }),

        Expires = DateTime.UtcNow.AddMinutes(time), // Token expiration time
        SigningCredentials = new SigningCredentials(
          new SymmetricSecurityKey(key),
          SecurityAlgorithms.HmacSha256Signature
        )
      };

      var token = tokenHandler.CreateToken(tokenDescriptor);
      return tokenHandler.WriteToken(token);
    }

    public static Dictionary<string, List<string>> ParseToken(string token)
    {
      try
      {
        var handler = new JwtSecurityTokenHandler();
        var tokenData = handler.ReadJwtToken(token);

        var claims = new Dictionary<string, List<string>>();

        foreach (var claim in tokenData.Claims)
        {
          if (claims.ContainsKey(claim.Type))
          {
            claims[claim.Type].Add(claim.Value);
          }
          else
          {
            claims[claim.Type] = new List<string> { claim.Value };
          }
        }

        return claims;
      }
      catch (Exception ex)
      {
        // Handle token parsing errors
        return new Dictionary<string, List<string>>
        {
          {
            "error",
            new List<string> { ex.Message }
          }
        };
      }
    }
  }
}
