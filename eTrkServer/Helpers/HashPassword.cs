using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace eTrkServer.Helpers
{
  public class HashPassword
  {
    public HashPassword() { }

    public string Password(string password)
    {
      byte[] passwordBytes = Encoding.UTF8.GetBytes(password);

      using (SHA256 sha256 = SHA256.Create())
      {
        byte[] hashedBytes = sha256.ComputeHash(passwordBytes);

        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < hashedBytes.Length; i++)
        {
          builder.Append(hashedBytes[i].ToString("x2"));
        }
        return builder.ToString();
      }
    }
  }
}
