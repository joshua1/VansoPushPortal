var App = require('app');
App.AuthController = Em.Controller.extend({

    authenticated: false,
    failedAttempts: 0,
    email:'',
    password:'',

    authenticate: function() {
        //call the authentication service url to authenticate
        var username=this.get('email');
        var pWord=this.get('password');
        if(username ==='' || pWord ===''){
            $.gritter.add({alertTitle:'Error',alertText:'All fields are required'});
        }
        else
        {
        if (this.credentialsValid(username,pWord)) {
            this.set('authenticated', true);
        } else {
            $.gritter.add({text:'Login failed',title:'Error'});
            this.set('authenticated',false);
        }
        }
    },

    credentialsValid: function(username,pWord) {
        var ret=false;

        jQuery.ajax({
            url:'/api/auth/credentials',
            data: {UserName:username,Password:pWord,RememberMe:true},
            dataType: 'json',
            type: 'POST',

            success: function(data) {
                ret=true;
            },
            error:function(){
                ret=false;

            }
        });


        return ret;
    },
    logOut:function(){
      //log the user out via the service
        this.set('authenticated',false);
    },

    authenticatedDidChange: function() {
        if (this.get('authenticated')) {
            this.get('target').send('becomeAuthenticated');
        }
        else
        {
            this.get('target').send('loggedOff');
        }
    }.observes('authenticated')

});