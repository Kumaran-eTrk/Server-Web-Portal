# Stage 1: Define the base image for the application
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base

# SKIA Sharp Config
RUN apt-get update && apt-get install -y libfontconfig1

# LDAP Config
RUN apt-get update \
   && apt-get install -y --no-install-recommends \
     libldap-2.5-0 \
   && rm -rf /var/lib/apt/lists/* \
 
# Set the working directory inside the container
WORKDIR /app

# Expose port 80 for the application
EXPOSE 8080

# Stage 2: Build the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Set the working directory for the build stage
WORKDIR /src

# Copy the project file and restore dependencies
COPY ["UserMonitorAPIServer.csproj", "."]
RUN dotnet restore "UserMonitorAPIServer.csproj"

# Copy the entire application code into the container
COPY . .

# Build the application
RUN dotnet build "UserMonitorAPIServer.csproj" -c Release -o /app/build

# Stage 3: Publish the application
FROM build AS publish

# Publish the application to the /app/publish directory
RUN dotnet publish "UserMonitorAPIServer.csproj" -c Release -o /app/publish

# Stage 4: Create the final runtime image
FROM base AS final

# Set the working directory for the final stage
WORKDIR /app

# Copy the published application from the 'publish' stage
COPY --from=publish /app/publish .

# Set the entry point for the container
ENTRYPOINT ["dotnet", "UserMonitorAPIServer.dll"]
