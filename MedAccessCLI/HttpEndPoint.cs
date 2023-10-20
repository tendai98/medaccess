using System;
using System.Net;
using System.Text.Json;
using System.Collections.Generic;

namespace MedAccessCLI{

    class HttpEndPoint : Constants {

        public Dictionary<string, string> post(Dictionary<string, string> commandObject){

            Dictionary<string, string> output = new Dictionary<string, string>();
            try{
            var cli = new WebClient();
            string commandJSONString = JsonSerializer.Serialize(commandObject);
			cli.Headers[HttpRequestHeader.ContentType] = ContentType;
			string response = cli.UploadString(BACKEND_SERVER_URL, commandJSONString);
            output = JsonSerializer.Deserialize<Dictionary<string, string>>(response);
            return output;

            }catch{
            }

            return output;
        }

    }

}