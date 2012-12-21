using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using ServiceModel;
using ServiceModel.Operations;
using ServiceStack.ServiceInterface;
using ServiceStack.OrmLite;
using ServiceStack.OrmLite.SqlServer;

namespace ServiceLogic
{
   
    public class MessageService :Service
    {
        public string ApiToken = ConfigurationManager.AppSettings["ApiToken"];
        public string ApplicationCode = ConfigurationManager.AppSettings["ApplicationCode"];
        
        public MessageResponse Post(Messages msg)
        {
            List<string> deviceTokens = null;
            List<Message> messageList=new List<Message>();
            
           MessageOptions req=new MessageOptions();
            req.request.application = ApplicationCode;
            req.request.auth = ApiToken;
            req.request.notifications.content = msg.MessageText;
            foreach (string item in msg.PhoneNumbers)
            {
                string item1 = item;
                var firstOrDefault = Db.Select<Device>(q => q.DevicePhoneNumber == item1).FirstOrDefault();
                if (firstOrDefault != null)
                {
                    Message newMessage=new Message();
                    newMessage.PhoneNumber = item1;
                    newMessage.MessageText = msg.MessageText;

                    string token = firstOrDefault.DeviceToken;
                    deviceTokens.Add(token);
                    messageList.Add(newMessage);
                }
            }
            req.request.notifications.devices = new List<string>(deviceTokens.ToArray());
            MessageResponse resp = PushService.DoSendMessage(req);
            foreach (var message in messageList)
            {
                message.DateSent = DateTime.Now;
                message.MessageStatus = resp.status_message;
                message.StatusCode = int.Parse(resp.status_code);
                message.MessageId = resp.response.messages[0];
            }
            Db.SaveAll(messageList);
            return resp;
        }
    }
}
