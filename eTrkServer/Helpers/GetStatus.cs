namespace eTrkServer.Helpers
{
  public static class GetStatus
  {
    public static string GetStatusString(int status)
    {
      switch (status)
      {
        case 0:
          return "Pending";
        case 1:
          return "Approved";
        case 2:
          return "Rejected";
        default:
          return "Unknown";
      }
    }
  }
}
