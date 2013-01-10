var App = require('app');

App.ApplicationController = Em.Controller.extend({
    authenticatedBinding:'App.authController.authenticated',
    userName: function() {
        if (this.get('authenticated')) {
            return 'friend';
        } else {
            return 'Account';
        }
    }.property('authenticated')
});