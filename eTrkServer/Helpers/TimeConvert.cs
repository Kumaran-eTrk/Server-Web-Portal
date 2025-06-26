namespace eTrkServer.Helpers
{
  public static class TimeConvert
  {
    public static string ConvertToHoursFormat(string timeDuration)
    {
      // Assuming the input format is "hh:mm:ss"
      var parts = timeDuration.Split(':');

      // Extract hours and minutes
      var hours = parts[0];
      var minutes = parts[1];

      // Concatenate hours and minutes with a dot
      return $"{hours}.{minutes}";
    }
  }
}
