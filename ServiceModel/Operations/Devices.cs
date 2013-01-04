using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ServiceStack.ServiceHost;
using ServiceStack.ServiceInterface.ServiceModel;

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
         public DeviceResponse()
         {
             this.ResponseStatus=new ResponseStatus();
         }
         public long DeviceId { get; set; }
       
         public ResponseStatus ResponseStatus { get; set; }
     }
}
