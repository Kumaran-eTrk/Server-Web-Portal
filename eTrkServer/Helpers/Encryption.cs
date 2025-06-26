using System.Security.Cryptography;
using System.Text;

namespace eTrkServer.Helpers
{
  public class Encryption
  {
    private static string EncryptKey;
    private readonly IConfiguration _configuration;

    public Encryption(IConfiguration configuration)
    {
      _configuration = configuration;
      EncryptKey = _configuration["EncryptionKey"];
    }

    public byte[] GenerateSalt(string customString, int size = 32)
    {
      using (var rng = new RNGCryptoServiceProvider())
      {
        var buffer = new byte[size];
        rng.GetBytes(buffer);
        var randomPart = Convert.ToBase64String(buffer);

        var combinedString = customString + randomPart;
        using (var sha256 = SHA256.Create())
        {
          var hash = sha256.ComputeHash(Encoding.UTF8.GetBytes(combinedString));
          return hash;
        }
      }
    }

    public string Encrypt(string clearText, byte[] salt)
    {
      byte[] clearBytes = Encoding.Unicode.GetBytes(clearText);
      using (Aes encryptor = Aes.Create())
      {
        Rfc2898DeriveBytes pdb = new Rfc2898DeriveBytes(EncryptKey, salt);
        encryptor.Key = pdb.GetBytes(32);
        encryptor.IV = pdb.GetBytes(16);
        using (MemoryStream ms = new MemoryStream())
        {
          using (
            CryptoStream cs = new CryptoStream(
              ms,
              encryptor.CreateEncryptor(),
              CryptoStreamMode.Write
            )
          )
          {
            cs.Write(clearBytes, 0, clearBytes.Length);
            cs.Close();
          }
          clearText = Convert.ToBase64String(ms.ToArray());
        }
      }
      return clearText;
    }

    public string Decrypt(string cipherText, byte[] salt)
    {
      cipherText = cipherText.Replace(" ", "+");
      byte[] cipherBytes = Convert.FromBase64String(cipherText);
      using (Aes encryptor = Aes.Create())
      {
        Rfc2898DeriveBytes pdb = new Rfc2898DeriveBytes(EncryptKey, salt);
        encryptor.Key = pdb.GetBytes(32);
        encryptor.IV = pdb.GetBytes(16);
        using (MemoryStream ms = new MemoryStream())
        {
          using (
            CryptoStream cs = new CryptoStream(
              ms,
              encryptor.CreateDecryptor(),
              CryptoStreamMode.Write
            )
          )
          {
            cs.Write(cipherBytes, 0, cipherBytes.Length);
            cs.Close();
          }
          cipherText = Encoding.Unicode.GetString(ms.ToArray());
        }
      }
      return cipherText;
    }
  }
}
