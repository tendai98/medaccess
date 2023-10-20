using System;

namespace MedAccessCLI
{
	class CommandEngine : Constants
	{

		private SystemMethods cmdOperations;
		private HttpEndPoint httpEndPoint;
		private bool IsAuthorized = false;

		public CommandEngine(){
			cmdOperations = new SystemMethods();
			httpEndPoint = new HttpEndPoint();
			Console.WriteLine(EngineReadyMessage);
		}

		public void Execute(string [] args){

			switch(args[0]){
				case HELP_CMD:
					cmdOperations.HelpCommand(httpEndPoint, args);
					break;

				case LOGIN_CMD:
					IsAuthorized = cmdOperations.LoginCommand(httpEndPoint, args);
					break;

				case ADD_USER_CMD:
					if(IsAuthorized){
						cmdOperations.AddUserCommand(httpEndPoint, args);
					}else
					{
						Console.WriteLine(LoginMessage);
					}
					break;

				case DEL_USER_CMD:
					if(IsAuthorized){
						cmdOperations.DelUserCommand(httpEndPoint, args);
					}else
					{
						Console.WriteLine(LoginMessage);
					}
					break;
				
				
				case USER_LOGS_CMD:
					if(IsAuthorized){
						cmdOperations.UserLogsCommand(httpEndPoint, args);
					}else
					{
						Console.WriteLine(LoginMessage);
					}
					break;


				case PRUNE_TOKEN_CMD:
					if(IsAuthorized){
						cmdOperations.PruneTokens(httpEndPoint, args);
					}else
					{
						Console.WriteLine(LoginMessage);
					}
					break;

				case CONFIG_ADMIN_CMD:
					if(IsAuthorized){
						cmdOperations.ConfigAdminUser(httpEndPoint, args);
					}else
					{
						Console.WriteLine(LoginMessage);
					}
					break;				

				case LS_USERS_CMD:
					if(IsAuthorized){
						cmdOperations.ListUsersCommand(httpEndPoint, args);
					}else
					{
						Console.WriteLine(LoginMessage);
					}
					break;

				case SET_TLV_CMD:
					if(IsAuthorized){
						cmdOperations.SetTLVValueCommand(httpEndPoint, args);
					}else
					{
						Console.WriteLine(LoginMessage);
					}
					break;

				case MONITOR_CMD:
					if(IsAuthorized){
						cmdOperations.SetMonitorEntryCommand(httpEndPoint, args);
					}else
					{
						Console.WriteLine(LoginMessage);
					}
					break;

				case DROP_MONITOR_CMD:
					if(IsAuthorized){
						cmdOperations.DropMonitorEntryCommand(httpEndPoint, args);
					}else
					{
						Console.WriteLine(LoginMessage);
					}
					break;

				case LS_TLV_MONITOR_CMD:
					if(IsAuthorized){
						cmdOperations.ListTLVMonitorsCommand(httpEndPoint, args);
					}else
					{
						Console.WriteLine(LoginMessage);
					}
					break;

				case DRUG_CTL_CMD:
					if(IsAuthorized){
						cmdOperations.DrugControlCommand(httpEndPoint, args);
					}else
					{
						Console.WriteLine(LoginMessage);
					}
					break;


				case RESET_TLV_CMD:
					if(IsAuthorized){
						cmdOperations.ResetTLVMonitorsCommand(httpEndPoint, args);
					}else
					{
						Console.WriteLine(LoginMessage);
					}
					break;

				default:
					Console.WriteLine(CommandNotFoundMessage);
					break;
				
			}

		}
	}
}
