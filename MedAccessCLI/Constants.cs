using System;

namespace MedAccessCLI
{
	class Constants
	{
                public const string ContentType = "application/json";
                public const string BACKEND_SERVER_URL = "https://medaccess-webapp.herokuapp.com/cli";
                public const string UserLogsBanner = "\t\t\t[-----------------[User Time Logs]------------------]\n";
                public const string ListUsersBanner = "\t\t\t[-----------------[Users]------------------]\n";
                public const string ListMonitorsBanner = "\t\t\t[-----------------[Monitors]------------------]\n";
                public const string HELP_CMD           = "help";
                public const string LS_USERS_CMD       = "ls-users";
                public const string LOGIN_CMD          = "login";
                public const string ADD_USER_CMD       = "add-user";
                public const string DEL_USER_CMD       = "del-user";
                public const string USER_LOGS_CMD      = "user-logs";
                public const string SESSION_NODE       = "sessions";
                public const string PRUNE_TOKEN_CMD    = "prune-tokens";
                public const string CONFIG_ADMIN_CMD    = "config-admin";
                public const string SET_TLV_CMD = "set-tlv";
                public const string MONITOR_CMD = "set-monitor";
                public const string DROP_MONITOR_CMD = "drop-monitor";
                public const string LS_TLV_MONITOR_CMD = "ls-monitors";
                public const string RESET_TLV_CMD = "reset-monitors";
                public const string DRUG_CTL_CMD = "drug-ctl";
                public const string SUCCESS_MESSAGE = "Success";
                public const string ERROR_FILTER = "error";
                public const string NO_LOGS_FOUND_MSG = "No logs found";
                public const string USER_TYPE = "user";
                public const string USER_COLLECTION = "users";

                public const string USER_TYPE_AMIN = "admin";
                public const string DEFAULT_USER_UID = "1001";
                public const string HelpInformation = @"

                                -----------------[System Command Help Information]-------------------

                    add-user        [email-address] [clinic] [email-service-provider]   -   Add User to the system
                    login           [admin-username] [admin-password]                   -   Login command for system control
                    config-admin    [username] [password]                               -   Configure admin user account
                    set-monitor     [key] [value]                                       -   Attach a monitor to TLV
                    user-logs       [log-query]                                         -   Access user log informtion
                    del-user        [username]                                          -   Delete a user from the system
                    set-tlv         [value]                                             -   Set TLV Value
                    drop-monitor    [key]                                               -   Remove a monitor from TLV
                    ls-users                                                            -   List users in the system
                    ls-monitors                                                              -   List all TLV Monitors
                    reset-monitors                                                      -   Delete all TLV Monitors   
                    prune-tokens                                                        -   Cleanup expired tokens       
                    help                                                                -   Display this help message
                    
                    ";

                public const string LoginMessage = "\t[!] Login with your system credentials";

                public const string SubCommandErrorMessage = "[!] Subcommand is not supoorted";
                public const string EngineReadyMessage = "[+] Command Engine ::[READY]";
                public const string CommandNotFoundMessage = "Command not implemented: Type 'help' for info";
                public const string ExecutionFailedMessage = "Failed to execute: Type 'help' for info";
                public const string CommandPrompt = "Admin:///> ";
                public const string SystemBanner = "\t\t[----MedAccess Admin CLI----]";
                public const string DelimiterString = " ";
                public const string EmptyString = "";
                public const int MaximumArgumentCount = 25;

	}
}
