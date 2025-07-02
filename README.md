# Server-Web-Portal

## Getting started

To make it easy for you to get started with GitLab, here's a list of recommended next steps.

Already a pro? Just edit this README.md and make it your own. Want to make it easy? [Use the template at the bottom](#editing-this-readme)!

### Minimum System Requirements

RAM: 8 GB.

Hard Disk: 500 GB.

Processor: Intel i7 or i5.

Operating System: Ubuntu (Preferred for compatibility).

### Network & Security Requirements

Public Static IP Address: Required for remote access and deployment.

DNS Configuration: Set up to ensure proper domain resolution.

SSL Certificate: Mandatory for enabling HTTPS and securing communication.

Email ID for Notifications: Required for system notifications (Multi-Factor Authentication should be disabled).

### Software Dependencies

PostgreSQL Database: Used for data storage.

Docker & Docker Compose: Required for deploying the Web App and Web API.

Apache Web Server: Set up as a reverse proxy for handling incoming web traffic and forwarding it to the appropriate services.

Ensure all dependencies are installed and properly configured before proceeding with deployment.

# Clone the repository:

`git clone https://github.com/Kumaran-eTrk/Server-Web-Portal.git`

# eTrkWebPortal Installation :

## Modify your neccessary configuration in .env production :

    VITE_API_URL="YOUR SERVER URL"
    VITE_AZURE_AUTHORITY= "AZUERE AUTHORITY"
    VITE_AZURE_CLIENTID= "AZURE CLIENT ID"
    VITE_REDIRECT_URL= "YOUR SERVER URL"
    VITE_AZURE= "FALSE" -- Azure Authentication
    VITE_DB_AUTH= "TRUE"   -- Database Authentication.

## Replace the Logo's in the public folder :

    Please ensure the following minimum image resolutions:

    Login_Logo.svg   : 250 × 70 pixels

    Sidebar_Logo.png : 130 × 120 pixels

    favicon.png      : 130 × 120 pixels

# eTrkServer Installation :

## Navigate to the project directory:

`nano .env`

## Configurations :

### modify the neccessary congigurations in .env file

### 1).BASE URL :

        # HTTP/HTTPS URL
        URL=http://localhost

        Replace your Domain URL to access the application in web.

### 2).LOGIN Configurations :

        LDAP configuration controls whether LDAP authentication is enabled (`true`) or disabled (`false`) and connection settings.


      # LDAP Configuration
        Mode=false


        changed the mode to false , it will the Database Authentication
        Or else it will be LDAP Authentication.

          # LDAP Configuration
            IPADDRESS=Server Address
            USERDOMAINNAME=domain

### 3).Default Password Configurations :

        It controls the default password of the user when the authentication happens through database.

           # User Default Password
           DEFAULT_PASSWORD=Welcome@123

### 4).Database Configurations :

        Configure database settings to enable the Monitor User Tool to interact with the specified database.

        This is the Default value ,if you want please replace your own credentials.
         # Postgres DB Configuration
            DB_USER=kumuser
            DB_PASSWORD=kum@5678!
            DB_NAME=usermonitor
            DB_PORT=5432

### 5).Email Configurations :

        Email settings enable to send the mail notifications about user activity to respective reporting  managers.

        # Mail Configuration
        MAIL_ADDRESS=Your Mail ID
        MAIL_PASSWORD=Password
        MAIL_HOSTNAME=Hostname
        MAIL_PORT=port

### 6).Non Logged Notification Configurations :

       Configure the email triggering time to notify reporting managers about user login status.The email will list users who have not logged in by the specified cut-off times.
     The time must be set in UTC, using a 24-hour format,
    and can only be specified on an hourly basis (e.g., 10:00, 17:00 — not 10:30 or 17:45).

       # NON LOGGED Notification
       MORNINGHOURUTC=5
       AFTERNOONHOURUTC=8
       EVENINGHOURUTC=12

### 7).Weekly Average Report Notification Configurations :

        Configure used to set the email execution time to sent the email about users weekly average report  to respective reporting  manager. The time should be in UTC time zone at 24
       format and will trigger only on Mondays.


      # Average Hours Notification
      AVERAGEHOURUTC=4
      AVERAGEMINUTEUTC=0
      AVERAGESECONDUTC=0

### 8).Consolidation Weekly Average Report Notification Configurations :

        Configure the email execution time to send the consolidated report of users' weekly averages to their respective reporting managers. The time should be set in the UTC time zone
        using a 24-hour format and will trigger only on Mondays.


     # Consolidate Average Hours Notification
      CONSOLIDATEHOURUTC=3
      CONSOLIDATEMINUTEUTC=0
      CONSOLIDATESECONDUTC=0

### 9).Agent Status Report Notification Configurations :

    Configure the email triggering time to send a consolidated report of users agent (application) running status to the IT Administrator Team.
    The time should be set in UTC using a 24-hour format and will trigger daily in the morning, afternoon, and evening.
    It can only be specified on an hourly basis (e.g., 10:00, 17:00 — not 10:30 or 17:45).


      # Agent Status Notification
      MORNINGHOURUTC=4
      AFTERNOONHOURUTC=8
      EVENINGHOURUTC=12

### 10).Agent Status Report Email Configurations :

        Configure the email to send the consolidated report of users' agent's(Application) running status to their IT Administrator Team. The time should be set in the UTC time zone  using a 24-hour format and will trigger daily on morning,afternoon and evening .


     # SysTeam Email
      EMAIL = Your Sys Team Email

### 11).CC Email Configurations :

        Configure the email to allow adding multiple email addresses in the CC field for the Weekly User's Average Report Notification.

      # CC Email's
      CC_EMAIL=["EMAIl ID"]

### 12).Average Hours Configurations :

       Configure the hours to send an weekly users average report  to users only who have average working hours less than the specified average hour.

    # AverageHours
      Hours=15

### 13).Encryption :

        Configure used to encrypt the agent product key.Generate the key using the command

     ``node -e "console.log(require('crypto').randomBytes(16).toString('hex'))``

       # API Security Keys
        AGENT_KEY= "YOUR ENCRYPTION KEY"

### 14).JWT Authenciation :

       Configure used to set JWT Authenciation to generate the token .Generate the key using the command

     ``node -e "console.log(require('crypto').randomBytes(16).toString('hex'))``.

         # API Security Keys
        JWT_KEY= "YOUR SECRET KEY"

### 15).Reset Password Expiry :

        Configure the expiration time of reset password token through mail.

        # Reset password link expiry minute
        EXPIRYMINUTES=5

### 16).PgAdmin Web Access :

          Configure the username and password to access the database anywhere using web browser.

          This is the Default value ,if you want please set your own credentials.

          # Pgadmin Configuration
          PGADMIN_EMAIL=sample@email.com
          PGADMIN_PASSWORD=sample@5678!@

# Database Access:

    Open the `localhost/pgadmin4` in the browser.(Default url)

    Login with the given credentials in the .env file.

    Connect the server by giving the  following credentials  which was mentioned in docker.compose.yaml:

    Hostname/Ip - postgres.
    Database Name - usermonitor.
    Username - <Username>
    Password - <Password>

# Deployment in server

## Use the cd command to navigate to the directory where the Docker Compose files are uploaded.

        After modification of the configurations for both UserMonitorApiServer and UserMonitorWebApp.

          ├── Parent Directory/
            ├── eTrkWebPortal
            ├── eTrkServer
            ├── eTrkVideoApi
            └── docker-compose.yaml

## naviagte to parent Directory

            `cd  Parent Directory`

## Deploying Docker Compose:

        Execute the following command to deploy the Docker Compose application:

        `docker-compose up -d --build`  // for up the application.
        `docker-compose down` // for down the application.

## Verifying Deployment:

        Once the deployment process completes, verify that the UI and API services are running correctly.By using this commands,we can verify the successful deployment.
        `docker ps` -> listing all running containers
        `docker logs container_name`

## Verify Database :

Kindly check the database in pgAdmin after starting the Docker server to verify whether the tables have been created or not.

### Uplodad the given Stored Procedures.txt form eTrkServer under your database procedures.\*\*

### Insert scripts for the initial record of the table :

### 1).ProjectMaster Table :

        INSERT INTO "ProjectMaster" ("Id", "ProjectName")
        VALUES ('9vcf57-87d2-4a4a-bad5-c3468bc7f95d', 'Demo Project');

### 2).UserDatas Table :

        INSERT INTO "UserDatas" ("Id", "Email", "DisplayName", "ReportingInto", "Division", "Location", "JobTitle", "ReportingIntoMail", "Branch", "ProjectId", "LocalADDomain", "LocalADUserName", "Password", "ModifiedBy", "ModifiedDatetime", "isDelete","VersionId","ShiftStartTime","ShiftEndTime","IsScreenshot")
        VALUES ('7fcf57-87d2-4a4a-bad5-c3468bc7f95d', 'user@gmail.com', 'Employee name', 'Manager name', 'Migration', 'India', 'Programmer', 'manager@example.com', 'Chennai', '9vcf57-87d2-4a4a-bad5-c3468bc7f95d', 'domainname', 'username', 'c75f28325cfa028ea13872f977a29e0e87c99a4f390fe260f24d7e1f05fb8d75', NULL, NULL, false,'1.0.0','9:00 AM','18:30 PM',true);

### 3).Role Table :

        INSERT INTO "RoleMaster" ("rolename", "description", "ModifiedBy", "ModifiedDatetime")
        VALUES ('Admin', 'Admin access', NULL, NULL),
        ('Manager', 'Manager access', NULL, NULL),
        ('System Admin', 'System Admin access', NULL, NULL);

### 5).UserRoles Table :

        INSERT INTO "UsersRoles" ("RoleId","useremail","ModifiedBy","ModifiedDatetime")
        VALUES ('1','user@gmail.com',NULL,'2025-03-20 11:27:29');

### 6).Holidays Table:

        INSERT INTO "Holidays" ("Id", "Holiday", "Date", "Location", "Branch", "ModifiedBy", "ModifiedTime")
        VALUES ('5dcf57-87d2-4a4a-bad5-c3468bc7f93e','New year', '2025-01-01 ', 'India', 'Chennai', NULL, NULL);

## For Futhermore Information, you can visit to our documentation site "https://etrk.kumaran.com/docs/" to learn more about application functionality.
