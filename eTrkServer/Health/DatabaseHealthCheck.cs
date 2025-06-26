using eTrkServer.DTO.RequestDTO;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;
using Npgsql;

internal sealed class DatabaseHealthCheck : IHealthCheck
{
  private GlobalConnectionString _conn;

  public DatabaseHealthCheck(IOptions<GlobalConnectionString> options)
  {
    _conn = options.Value;
  }

  public async Task<HealthCheckResult> CheckHealthAsync(
    HealthCheckContext context,
    CancellationToken cancellationToken = default
  )
  {
    using (var connection = new NpgsqlConnection(_conn.DefaultConnection))
    {
      try
      {
        await connection.OpenAsync(cancellationToken);

        using (var cmd = new NpgsqlCommand("SELECT 1", connection))
        {
          await cmd.ExecuteScalarAsync(cancellationToken);
        }

        return HealthCheckResult.Healthy();
      }
      catch (Exception e)
      {
        return HealthCheckResult.Unhealthy(exception: e);
      }
    }
  }
}
