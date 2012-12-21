using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ServiceStack.DataAnnotations;
using ServiceStack.ServiceHost;

namespace ServiceModel
{
   
    public class Device
    {
        [AutoIncrement]
        public long Id { get; set; }

     
        public string DeviceToken { get; set; }
         
        public string DevicePhoneNumber { get; set; }
    }

   

}
