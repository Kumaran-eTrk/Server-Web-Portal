using Microsoft.EntityFrameworkCore;

public static class MigrationExtension
{
    public static void ApplyMigrations(this IApplicationBuilder app){

       using IServiceScope scope = app.ApplicationServices.CreateScope();
       using AppDbContext dbContext = scope
                                      .ServiceProvider
                                      .GetRequiredService<AppDbContext>();
       dbContext.Database.Migrate();
    }
}