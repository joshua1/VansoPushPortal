using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ServiceStack.ServiceHost;

namespace ServiceModel.Operations
{
    [Route("/messages/new", "POST")]
    [Route("/messages", "GET")]
    [Route("/messages/{id}")]
    public class Messages
    {
        public string MessageText { get; set; }
        public List<string> PhoneNumbers { get; set; }
    }

    public class MessageResponse
    {
        public MessageResponse()
        {
            this.response = new Response();
        }
        public string status_code { get; set; }
        public string status_message { get; set; }
        public Response response { get; set; }
    }
    public class Response
    {
        public List<string> messages { get; set; }
    }
}
