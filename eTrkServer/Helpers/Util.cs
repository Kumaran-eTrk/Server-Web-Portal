using System;
using System.Net.NetworkInformation;
using eTrkServer.Entity;

namespace eTrkServer.Helpers
{
  public class Util
  {
    public static void AddIPAddress(IPAddressInfo iPAddressInfo, AppDbContext _context)
    {
      // Get all network interfaces on the local machine
      NetworkInterface[] networkInterfaces = NetworkInterface.GetAllNetworkInterfaces();

      foreach (NetworkInterface networkInterface in networkInterfaces)
      {
        // Filter out the interfaces which don't have a valid MAC Address
        if (networkInterface.OperationalStatus == OperationalStatus.Up)
        {
          if (!networkInterface.GetPhysicalAddress().ToString().Equals(""))
          {
            Console.WriteLine("Name: " + networkInterface.Name);
            Console.WriteLine("Description: " + networkInterface.Description);
            Console.WriteLine("MAC Address: " + networkInterface.GetPhysicalAddress().ToString());
            Console.WriteLine("-------------------------------");
          }
        }
      }

      List<IPAddressInfo> ipInfo = _context
        .IPAddresses.Where(s => s.UserName == iPAddressInfo.UserName)
        .ToList();
      if (ipInfo != null && ipInfo.Count > 0)
      {
        bool found = false;
        foreach (IPAddressInfo ip in ipInfo)
        {
          if (ip.IPAddress == iPAddressInfo.IPAddress) // Only when new IP Address found, add the same for the user
          {
            found = true;
            break;
          }
        }
        if (!found)
        {
          _context.IPAddresses.Add(iPAddressInfo);
          Console.WriteLine("Writing the IP Address");
          _context.SaveChanges();
        }
      }
      else
      {
        _context.IPAddresses.Add(iPAddressInfo);
        Console.WriteLine("Writing the IP Address2");
        _context.SaveChanges();
      }
    }

    public static bool AreDatesEqualUpToMinute(DateTime date1, DateTime date2)
    {
      DateTime truncatedDate1 = new DateTime(
        date1.Year,
        date1.Month,
        date1.Day,
        date1.Hour,
        date1.Minute,
        0
      );

      DateTime truncatedDate2 = new DateTime(
        date2.Year,
        date2.Month,
        date2.Day,
        date2.Hour,
        date2.Minute,
        0
      );

      return truncatedDate1 == truncatedDate2;
    }
  }
}
