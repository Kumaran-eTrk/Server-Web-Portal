dotnet ef database update 0
dotnet ef migrations remove
dotnet ef migrations add InitialMigrations
dotnet ef database update
