var App = require('app');

App.ApplicationController = Em.Controller.extend({
    authenticatedBinding:Ember.Binding.oneWay(this.get('controller.AuthController').authenticated),
    userName: function() {
        if (this.get('authenticated')) {
            return 'friend';
        } else {
            return 'Account';
        }
    }.property('authenticated')
});