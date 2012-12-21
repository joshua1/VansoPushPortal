using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ServiceStack.ServiceHost;

namespace ServiceModel.Operations
{
     [Route("/devices/new", "POST")]
    [Route("/devices/{PhoneNumber}")]
    public class Devices
    {
         public string PhoneNumber { get; set; }
         public string DeviceToken { get; set; }
    }

     public class DeviceResponse
     {
         public bool Status { get; set; }
         public string Status_Message { get; set; }
     }
}
