using System;
using System.Collections.Generic;

namespace MedAccessCLI
{
	class SystemMethods : Constants
	{
		public void HelpCommand(HttpEndPoint endPoint, string [] args){
					Console.WriteLine(HelpInformation);
		}

		public bool LoginCommand(HttpEndPoint endPoint, string [] args){
			if(args.Length >= 3){

				Dictionary<string, string> commandObject = new Dictionary<string, string>();
				commandObject.Add("command","login");
				commandObject.Add("username", args[1]);
				commandObject.Add("password", args[2]);
				Dictionary<string, string> returnObject = endPoint.post(commandObject);
				Console.WriteLine(returnObject["errorMessage"]);
				if (SUCCESS_MESSAGE.Equals(returnObject["errorMessage"])){
					return true;
				}else{
					return false;
				}

			}else{
				Console.WriteLine(ExecutionFailedMessage);
			}

			return false;
		}

		public void AddUserCommand(HttpEndPoint endPoint, string [] args){
			if(args.Length >= 4){

				Dictionary<string, string> commandObject = new Dictionary<string, string>();
				commandObject.Add("command","add-user");
				commandObject.Add("email", args[1]);
				commandObject.Add("clinic", args[2]);
				commandObject.Add("service", args[3]);
				commandObject.Add("uid", DEFAULT_USER_UID);
				Dictionary<string, string> returnObject = endPoint.post(commandObject);
				Console.WriteLine(returnObject["errorMessage"]);

			}else{
				Console.WriteLine(ExecutionFailedMessage);
			}

		}

		public void DelUserCommand(HttpEndPoint endPoint, string [] args){
			if(args.Length >= 2){

				Dictionary<string, string> commandObject = new Dictionary<string, string>();
				commandObject.Add("command","del-user");
				commandObject.Add("username", args[1]);
				Dictionary<string, string> returnObject = endPoint.post(commandObject);
				Console.WriteLine(returnObject["errorMessage"]);

			}else{
				Console.WriteLine(ExecutionFailedMessage);
			}

		}

		public void UserLogsCommand(HttpEndPoint endPoint, string [] args){
			if(args.Length >= 2){

				Dictionary<string, string> commandObject = new Dictionary<string, string>();
				commandObject.Add("command","user-logs");
				commandObject.Add("query", args[1]);
				Dictionary<string, string> returnObject = endPoint.post(commandObject);
				
				Console.WriteLine(UserLogsBanner);

				foreach (KeyValuePair<string, string> logObject in returnObject) {
					if(!logObject.Value.Equals(SUCCESS_MESSAGE) && !logObject.Value.Equals(ERROR_FILTER) && !logObject.Value.Equals(NO_LOGS_FOUND_MSG)){
   						Console.WriteLine("\t\t{0}", logObject.Value);
					}
				}

				Console.WriteLine(returnObject["errorMessage"]);

			}else{
				Console.WriteLine(ExecutionFailedMessage);
			}
		}

		public void ListUsersCommand(HttpEndPoint endPoint, string [] args){
			if(args.Length >= 1){
				Dictionary<string, string> commandObject = new Dictionary<string, string>();
				commandObject.Add("command","list-users");
				commandObject.Add("query", USER_COLLECTION);
				Dictionary<string, string> returnObject = endPoint.post(commandObject);

				Console.WriteLine(ListUsersBanner);
				foreach (KeyValuePair<string, string> userObject in returnObject) {
					if(!userObject.Value.Equals(SUCCESS_MESSAGE) && !userObject.Value.Equals(ERROR_FILTER)){
   						Console.WriteLine("\t\t{0}:\t{1}", userObject.Key, userObject.Value);
					}
				}
				Console.WriteLine(returnObject["errorMessage"]);

			}else{
				Console.WriteLine(ExecutionFailedMessage);
			}
		}

		public void PruneTokens(HttpEndPoint endPoint, string [] args){
			if(args.Length >= 1){

				Dictionary<string, string> commandObject = new Dictionary<string, string>();
				commandObject.Add("command","prune-tokens");
				commandObject.Add("target", SESSION_NODE);
				Dictionary<string, string> returnObject = endPoint.post(commandObject);
				Console.WriteLine(returnObject["errorMessage"]);

			}else{
				Console.WriteLine(ExecutionFailedMessage);
			}
		}

		public void ConfigAdminUser(HttpEndPoint endPoint, string [] args){
			if(args.Length >= 3){

				Dictionary<string, string> commandObject = new Dictionary<string, string>();
				commandObject.Add("command","config-admin");
				commandObject.Add("username", args[1]);
				commandObject.Add("password", args[2]);
				commandObject.Add("type", USER_TYPE_AMIN);
				commandObject.Add("uid", DEFAULT_USER_UID);
				Dictionary<string, string> returnObject = endPoint.post(commandObject);
				Console.WriteLine(returnObject["errorMessage"]);

			}else{
				Console.WriteLine(ExecutionFailedMessage);
			}
		}

		public void SetTLVValueCommand(HttpEndPoint endPoint, string [] args){
			if(args.Length >= 2){

				Dictionary<string, string> commandObject = new Dictionary<string, string>();
				commandObject.Add("command","set-tlv");
				commandObject.Add("value", args[1]);
				Dictionary<string, string> returnObject = endPoint.post(commandObject);

				Console.WriteLine(returnObject["errorMessage"]);

			}else{
				Console.WriteLine(ExecutionFailedMessage);
			}
		}

		public void SetMonitorEntryCommand(HttpEndPoint endPoint, string [] args){
			if(args.Length >= 3){

				Dictionary<string, string> commandObject = new Dictionary<string, string>();
				commandObject.Add("command","monitor-tlv");
				commandObject.Add(args[1], args[2]);
				Dictionary<string, string> returnObject = endPoint.post(commandObject);
				Console.WriteLine(returnObject["errorMessage"]);

			}else{
				Console.WriteLine(ExecutionFailedMessage);
			}
		}
		

		public void DropMonitorEntryCommand(HttpEndPoint endPoint, string [] args){
			if(args.Length >= 2){

				Dictionary<string, string> commandObject = new Dictionary<string, string>();
				commandObject.Add("command","drop-tlv");
				commandObject.Add("query", args[1]);
				Dictionary<string, string> returnObject = endPoint.post(commandObject);
				Console.WriteLine(returnObject["errorMessage"]);

			}else{
				Console.WriteLine(ExecutionFailedMessage);
			}
		}

		public void ListTLVMonitorsCommand(HttpEndPoint endPoint, string [] args){
			if(args.Length >= 1){

				Dictionary<string, string> commandObject = new Dictionary<string, string>();
				commandObject.Add("command","ls-tlv");
				Dictionary<string, string> returnObject = endPoint.post(commandObject);

				Console.WriteLine(ListMonitorsBanner);
				foreach (KeyValuePair<string, string> dataObject in returnObject) {
					if(!dataObject.Value.Equals(SUCCESS_MESSAGE) && !dataObject.Value.Equals(ERROR_FILTER)){
   						Console.WriteLine("\t\t{0}:\t{1}", dataObject.Key, dataObject.Value);
					}
				}
				
				Console.WriteLine(returnObject["errorMessage"]);

			}else{
				Console.WriteLine(ExecutionFailedMessage);
			}
		}

		public void ResetTLVMonitorsCommand(HttpEndPoint endPoint, string [] args){
			if(args.Length >= 1){

				Dictionary<string, string> commandObject = new Dictionary<string, string>();
				commandObject.Add("command","reset-tlv");
				Dictionary<string, string> returnObject = endPoint.post(commandObject);
				Console.WriteLine(returnObject["errorMessage"]);

			}else{
				Console.WriteLine(ExecutionFailedMessage);
			}
		}

		public void DrugControlCommand(HttpEndPoint endPoint, string [] args){
			if(args.Length >= 1){
				Dictionary<string, string> commandObject = new Dictionary<string, string>();
				Dictionary<string, string> returnObject;

				commandObject.Add("command","drug-ctl");

				switch(args[1]){

					case "create":
						commandObject.Add("operation", "create");
						commandObject.Add("name", args[2]);
						commandObject.Add("quantity", args[3]);
						commandObject.Add("price", args[4]);
						returnObject = endPoint.post(commandObject);
						Console.WriteLine(returnObject["errorMessage"]);
						break;

					case "read":
						commandObject.Add("operation", "read");
						returnObject = endPoint.post(commandObject);
						Console.WriteLine(returnObject["errorMessage"]);
						break;

					case "read-all":
						commandObject.Add("operation", "read-all");
						returnObject = endPoint.post(commandObject);
						Console.WriteLine(returnObject["errorMessage"]);
						break;

					case "update":
						commandObject.Add("operation", "update");
						returnObject = endPoint.post(commandObject);
						Console.WriteLine(returnObject["errorMessage"]);
						break;

					case "delete":
						commandObject.Add("operation", "remove");
						returnObject = endPoint.post(commandObject);
						Console.WriteLine(returnObject["errorMessage"]);
						break;

					default:
						Console.WriteLine(SubCommandErrorMessage);
						break;

				}

			}else{
				Console.WriteLine(ExecutionFailedMessage);
			}
			

		}
	}
}
