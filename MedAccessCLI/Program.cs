using System;

namespace MedAccessCLI 
{
    class MedAccess : Constants
    {

	private CommandEngine cmdEngine;

	private string [] CommandLineParser(string commandString){
		string [] args;
		int index = 0;
		int count = 1;
		foreach (var arg in commandString.Split(DelimiterString)){
			if(!arg.Equals(EmptyString)){
				count++;
			}
		}

		args = new string[count-1];
		foreach (var arg in commandString.Split(DelimiterString)){
			if(!arg.Equals(EmptyString)){
				args[index] = arg;
				index++;
			}
		}
		return args;
	}

	private string RunCLI(){

		string buffer;
		string [] args;
		cmdEngine = new CommandEngine();

		while(true){
			Console.Write(CommandPrompt);
			buffer = Console.ReadLine();
			if(buffer.Length != 0){
				args = CommandLineParser(buffer);
				try{
					cmdEngine.Execute(args);
				}catch{
					Console.WriteLine("[!] Command Execution Error");
				}
			}
		}
	}


        static void Main(string[] args)
        {
		Console.WriteLine(SystemBanner);
		MedAccess medAccess = new MedAccess();
		medAccess.RunCLI();
        }
    }
}
