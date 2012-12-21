using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ServiceModel.Operations;
using ServiceStack.OrmLite;
using ServiceStack.ServiceInterface;

namespace ServiceLogic
{
    public class DeviceService:Service
    {
        public DeviceResponse Post(Devices dev)
        {
            //subject to one device per phone number
            Devices dv = new Devices {DeviceToken = dev.DeviceToken, PhoneNumber = dev.PhoneNumber};
            Db.Save(dv);
            return new DeviceResponse {Status = true, Status_Message = "Saved"}; //status message can be phone number in use depending on rule 
        }
    }
}
