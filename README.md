# MedAccess Project

The **MedAccess Project** is a comprehensive mock system designed for use in healthcare facilities, specifically hospitals, to record and analyze cases of sexually transmitted infections (STIs). The system includes a web dashboard, API, and a CLI tool for administrative tasks. It is built using JavaScript, Express.js for the API, and Vanilla JavaScript for the web dashboard. The system's core database is Firebase Firestore.

## Project Structure

The MedAccess Project is organized into several components:

### MedAccess (API and Web Dashboard)

- **MedAccess**: This folder contains the primary web application and API.
  - `app.js`: The main JavaScript file for the Express.js-based API.
  - `Dockerfile`: Configuration for Docker containerization.
  - `key.json`: Firebase key file for database access.
  - `package.json`: Node.js package configuration.
  - `Procfile`: Heroku deployment configuration.
  - `config.json`: Configuration settings for the application.
  - `firebase.js`: Firebase setup for database operations.
  - `mailer.js`: Email notification functionality.
  - `public`: Contains web assets, HTML files, JavaScript, and CSS.

### MedAccessCLI (Command Line Interface)

- **MedAccessCLI**: This folder contains the Command Line Interface (CLI) tool.
  - `CommandEngine.cs`: Logic for handling CLI commands.
  - `Constants.cs`: Constants used in the CLI tool.
  - `MedAccessCLI.csproj`: Project configuration file for the CLI tool.
  - `CommandOperationMethods.cs`: Implementation of command operations.
  - `HttpEndPoint.cs`: HTTP request handling for the CLI tool.
  - `Program.cs`: The main entry point for the CLI tool.

## MedAccess Backend (app.js) Functions

- `generateToken()`: Function to generate authentication tokens.
- `hashPassword(password)`: Function to hash user passwords.
- `sendErrorMessage(res, msg)`: Send an error message as a response.
- `sendCLIErrorMessage(res, msg)`: Send an error message from the CLI tool.
- `sendMessage(res, msg, data)`: Send a response message with optional data.
- `boostTokenLife(token)`: Extends the validity of an authentication token.
- `runVerifiedDataUpload(res, token, entry, origin)`: Upload verified data to the database.
- `authUser(args, respJSON, res)`: Authenticate regular users.
- `authAdminUser(args, res)`: Authenticate admin-level users.
- `getTimestamp()`: Get the current timestamp.
- `api(req, res)`: Main function for the Express.js API.
- `cli(req, res)`: Main function for CLI interactions.
- `boot()`: Start the Express.js server.

## MedAccess CLI Tool Commands

The MedAccessCLI tool provides various commands for system administration, including:

- `help`: Display available commands and usage.
- `ls-users`: List all users in the system.
- `login`: Authenticate an admin user.
- `add-user`: Add a new user.
- `del-user`: Delete a user.
- `user-logs`: View user logs.
- `prune-tokens`: Prune expired tokens.
- `config-admin`: Configure administrative settings.
- `set-tlv`: Set (TLV) value.
- `set-monitor`: Monitor user actions.
- `drop-monitor`: Stop monitoring user actions.
- `ls-monitors`: List active monitors.
- `reset-monitors`: Reset monitors.
- `drug-ctl`: Control drug data.

The CLI tool provides a simple and efficient way to manage the MedAccess system at an administrative level.

