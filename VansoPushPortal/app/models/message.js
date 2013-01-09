var App=require('app');
App.messageModel=DS.Model.extend({
    primaryKey:'id',
    MessageId:DS.attr('string'),
    StatusCode:DS.attr('int'),
    MessageStatus:DS.attr('string'),
    DateSent:DS.attr('date'),
    PhoneNumber:DS.attr('string'),
    MessageText:DS.attr('string'),
    reopenClass:{
        url:'/messages/'
    }
});
