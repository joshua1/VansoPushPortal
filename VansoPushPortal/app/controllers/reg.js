var App = require('app');
App.RegController=Em.ObjectController.extend({
    email:'',
    firstName:'',
    lastName:'',
    password:'',
    passwordRepeat:'',
    fullName:function(){
        var firstName = this.get('firstName');
        var lastName = this.get('lastName');

        return firstName + ' ' + lastName;
    }.property('firstName', 'lastName')
    ,
    registerUser:function(){
        var mail=this.get('email');
        var fName=this.get('firstName');
        var lName= this.get('lastName');
        var pWord=this.get('password');
        var rPWord=this.get('passwordRepaet')
       if(mail==='' || fName==='' ||lName==='' || pWord===''|| rPWord===''){
           $.gritter.add({alertTitle:'Error',alertText:'All fields are required'});
       } else
       {
           if(pWord===rPWord){
               var dName=this.get('fullName');
               jQuery.ajax({
                   url:'/api/register',
                   data: {UserName:mail,FirstName:fName,LastName:lName,DisplayName:dName,Email:mail,Password:pWord,AutoLogin:false},
                   dataType: 'json',
                   type: 'POST',

                   success: function(data) {
                       this.get('target').send('loggedOff');
                   },
                   error:function(){
                       $.gritter.add({alertText:'Registration failed',alertTitle:'Error'});
                   }
               });
           }
           else
           {
               $.gritter.add({alertTitle:'Error!',alertText:'Passwords do not match'});
           }
       }
    }

});