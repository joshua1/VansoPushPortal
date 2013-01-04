using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ServiceModel;
using ServiceModel.Operations;
using ServiceStack.OrmLite;
using ServiceStack.ServiceInterface;
using ServiceStack.ServiceInterface.ServiceModel;

namespace ServiceLogic
{
    public class DeviceService:Service
    {

        public DeviceResponse Post(Devices dev)
        {
            //subject to one device per phone number
            Device dv = new Device {DeviceToken = dev.DeviceToken, DevicePhoneNumber = dev.PhoneNumber};
            Db.Save(dv);
            return new DeviceResponse {DeviceId=Db.GetLastInsertId(),Message = "Saved",Status=true,Device=new Device{DeviceToken=dev.DeviceToken,DevicePhoneNumber=dev.PhoneNumber}}; 
        }
    }
}
