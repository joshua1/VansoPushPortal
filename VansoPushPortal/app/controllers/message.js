var App = require('app');
App.MessageController=Em.ArrayController.extend({
    content:[],
    allMessages:function(){
        return '';
    }
});