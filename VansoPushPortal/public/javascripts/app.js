(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    definition(module.exports, localRequire(name), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var require = function(name) {
    var path = expand(name, '.');

    if (has(cache, path)) return cache[path];
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex];
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '"');
  };

  var define = function(bundle) {
    for (var key in bundle) {
      if (has(bundle, key)) {
        modules[key] = bundle[key];
      }
    }
  }

  globals.require = require;
  globals.require.define = define;
  globals.require.brunch = true;
})();

window.require.define({"Proxy/BusinessLogic": function(exports, require, module) {
  var App = require('app');
  
}});

window.require.define({"Store/store": function(exports, require, module) {
  var App=require('app');
  App.messageStore=DS.Store.create({
      revision:11,
      adapter:App.adapter
  });

  App.deviceStore=DS.Store.create({
      revision:11,
      adapter:App.adapter
  });

  App.adapter=DS.Adapter.create({
      find:function(store,type,id){
          var url=type.url;
          url=url.fmt(id);
          jQuery.getJSON(url,function(data){
             store.load(type,id,data);
          });
      },
      findAll:function(store,type){
          var url=type.url;
          jQuery.getJSON(url,function(data){
              store.loadMany(type,data);
          });

      },
      createRecord:function(store,type,model){
          var url = type.url;
          jQuery.ajax({
              url: url,
              data: model.get('data'),
              dataType: 'json',
              type: 'POST',

              success: function(data) {
                  // data is a hash of key/value pairs representing the record.
                  // In general, this hash will contain a new id, which the
                  // store will now use to index the record. Future calls to
                  // store.find(type, id) will find this record.
                  store.didCreateRecord(model, data);
              }
          });
      },
      updateRecord:function(store,type,model){
          var url = type.url;

          jQuery.ajax({
              url: url.fmt(model.get('id')),
              data: model.get('data'),
              dataType: 'json',
              type: 'PUT',

              success: function(data) {
                  // data is a hash of key/value pairs representing the record
                  // in its current state on the server.
                  store.didUpdateRecord(model, data);
              }
          });

      },
      deleteRecord:function(store,type,model){
          var url = type.url;

          jQuery.ajax({
              url: url.fmt(model.get('id')),
              dataType: 'json',
              type: 'DELETE',

              success: function() {
                  store.didDeleteRecord(model);
              }
          });
      },
      commit: function(store, commitDetails) {
          commitDetails.updated.eachType(function(type, array) {
              this.updateRecords(store, type, array.slice());
          }, this);

          commitDetails.created.eachType(function(type, array) {
              this.createRecords(store, type, array.slice());
          }, this);

          commitDetails.deleted.eachType(function(type, array) {
              this.deleteRecords(store, type, array.slice());
          }, this);
      }
  });
}});

window.require.define({"app": function(exports, require, module) {
  // Application bootstrapper

  module.exports = Em.Application.create();
  
}});

window.require.define({"controllers": function(exports, require, module) {
  // load all your controllers here

  require('controllers/application');
  require('controllers/reg');
  require('controllers/message');
  require('controllers/auth');
  require('controllers/user');
  require('controllers/device');
  
}});

window.require.define({"controllers/application": function(exports, require, module) {
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
}});

window.require.define({"controllers/auth": function(exports, require, module) {
  var App = require('app');
  App.AuthController = Em.ObjectController.extend({

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
}});

window.require.define({"controllers/device": function(exports, require, module) {
  /**
   * Created with JetBrains WebStorm.
   * User: user
   * Date: 1/7/13
   * Time: 2:31 PM
   * To change this template use File | Settings | File Templates.
   */
  
}});

window.require.define({"controllers/message": function(exports, require, module) {
  var App = require('app');
  App.MessageController=Em.ArrayController.extend({
      content:[],
      allMessages:function(){
          return '';
      }
  });
}});

window.require.define({"controllers/reg": function(exports, require, module) {
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
}});

window.require.define({"controllers/tag": function(exports, require, module) {
  /**
   * Created with JetBrains WebStorm.
   * User: user
   * Date: 1/7/13
   * Time: 2:18 PM
   * To change this template use File | Settings | File Templates.
   */
  
}});

window.require.define({"controllers/user": function(exports, require, module) {
  /**
   * Created with JetBrains WebStorm.
   * User: user
   * Date: 1/7/13
   * Time: 1:16 PM
   * To change this template use File | Settings | File Templates.
   */
  
}});

window.require.define({"initialize": function(exports, require, module) {
  
  window.App = require('app');

  require('templates');
  require('models');
  require('controllers');
  require('views');
  require('router');
  App.Store = DS.Store.extend({
      revision: 11,
      adapter: DS.RESTAdapter.create({

      })
  });
  App.initialize();
  
}});

window.require.define({"models": function(exports, require, module) {
  // load all your models here

  require('models/message');
  require('models/user');
}});

window.require.define({"models/message": function(exports, require, module) {
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
  
}});

window.require.define({"models/user": function(exports, require, module) {
  // string SessionId
  //string UserName
  // string ReferrerUrl
  //ResponseStatus ResponseStatus
}});

window.require.define({"router": function(exports, require, module) {
  var App = require('app');

  App.Router = Em.Router.extend({
      root: Em.Route.extend({

          // The unknown default state; neither authenticated nor unauthenticated.
          // The router knows to enter this state by default, then the unknown
          // state can decide whether to enter authenticated or unauthenticated mode.
          default: Em.Route.extend({
              route: '/',

              enter: function(router) {
                  var authenticated = router.get('authController').get('authenticated');
                  // It's not at all obvious why this works :(
                  Em.run.next(function() {
                      if (authenticated) {
                          router.transitionTo('authenticated');
                      } else {
                          router.transitionTo('unauthenticated');
                      }
                  })
              }
          }),

          authenticated: Em.Route.extend({
              initialState: 'messages',

              message:Em.Route.extend({
                  route:'/message',
                  connectOutlets:function(router){
                      router.get('applicationController').connectOutlet('message');
                  }
              }),
              messages:Em.Route.extend({
                  route:'/messages',
                  connectOutlets:function(router){
                      router.get('applicationController').connectOutlet('messages',App.MessageController.allMessages());
                  }
              }),
              device:Em.Route.extend({
                  route:'/device',
                  connectOutlets:function(router){
                      router.get('applicationController').connectOutlet('device');
                  }
              }),
              tag:Em.Route.extend({
                  route:'/tag',
                  connectOutlets:function(router){
                      router.get('applicationController').connectOutlet('tag');
                  }
              }),
              tags:Em.Route.extend({
                  route:'/tags',
                  connectOutlets:function(router){
                      router.get('applicationController').connectOutlet('tags');
                  }
              }),
              geozone:Em.Route.extend({
                  route:'/geozone',
                  connectOutlets:function(router){
                      router.get('applicationController').connectOutlet('geozone');
                  }
              }),
              geozones:Em.Route.extend({
                  route:'/geozones',
                  connectOutlets:function(router){
                      router.get('applicationController').connectOutlet('geozones');
                  }
              }),
              device:Em.Route.extend({
                  route:'/device',
                  connectOutlets:function(router){
                      router.get('applicationController').connectOutlet('device');
                  }
              }),
              logOut:function(router){
                  router.get('authController').logOut();

              },
              doTransition:function(router,context){
                  router.transitionTo(context);
              }

          }),

          unauthenticated: Em.Route.extend({
              initialState: 'auth',

              auth: Em.Route.extend({
                  route: '/auth'
                  ,
                  register:function(router){
                   router.transitionTo('reg');
                  },
                  connectOutlets: function(router) {
                      router.get('applicationController').connectOutlet('auth');
                  }
              }),
              reg:Em.Route.extend({
                  route:'/reg',
                  connectOutlets:function(router){
                      router.get('applicationController').connectOutlet('reg');
                  }
              }),

              authenticate: function(router) {
                  router.get('authController').authenticate();
              },

              becomeAuthenticated: function(router) {
                  router.transitionTo('authenticated');
              },
              loggedOff:function(router){
                  router.transitionTo('unauthenticated');
              },
              registered:function(router){
                  router.transitionTo('auth');
              }
          })

      })
  });
  
}});

window.require.define({"templates": function(exports, require, module) {
  // load all your templates here

  require('templates/application');
  require('templates/auth');
  require('templates/reg');
  require('templates/messages/message');
  require('templates/messages/messages');
  require('templates/users/user');
  require('templates/layout/userNav');
  require('templates/layout/navigation');

  
}});

window.require.define({"templates/application": function(exports, require, module) {
  
  Ember.TEMPLATES[module.id] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Ember.Handlebars.helpers;
    var buffer = '', stack1, stack2, stack3, foundHelper, tmp1, self=this, escapeExpression=this.escapeExpression;


    data.buffer.push("<div class=\"container\">\n\n    <div class=\"well\">\n\n    </div>\n</div>\n<div class=\"row-fluid\">\n    <div class=\"span12\">\n      <div id=\"header\">\n        <a href=\"#\" >\n         <image src=\"img/logo.png\" />\n        </a>\n        <div class=\"hright\">\n            ");
    stack1 = depth0;
    stack2 = "App.UserNavView";
    stack3 = helpers.view;
    tmp1 = {};
    tmp1.hash = {};
    tmp1.contexts = [];
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack3.call(depth0, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + "\n\n        </div>\n      </div>\n    </div>\n  </div>\n  </div>\n\n  <div class=\"container-fluid\" id=\"container\">\n    <div class=\"row-fluid\">\n           ");
    stack1 = depth0;
    stack2 = "App.NavigationView";
    stack3 = helpers.view;
    tmp1 = {};
    tmp1.hash = {};
    tmp1.contexts = [];
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack3.call(depth0, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + "\n\n        <div class=\"row-fluid\">\n          ");
    stack1 = depth0;
    stack2 = "outlet";
    stack3 = helpers._triageMustache;
    tmp1 = {};
    tmp1.hash = {};
    tmp1.contexts = [];
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack3.call(depth0, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + "\n          </div>\n\n        </div>\n    <footer>\n    </footer>\n    </div>\n   </div>");
    return buffer;
  });
   module.exports = module.id;
}});

window.require.define({"templates/auth": function(exports, require, module) {
  
  Ember.TEMPLATES[module.id] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Ember.Handlebars.helpers;
    var buffer = '', stack1, stack2, stack3, stack4, foundHelper, tmp1, self=this, escapeExpression=this.escapeExpression;


    data.buffer.push(" <div class=\"row-fluid\">\n                        <div class=\"span12\">\n                            <div class=\"box alternate\">\n                                <div class=\"box-title\">\n                                    Login\n                                </div>\n                                <div class=\"box-content nopadding\">\n                                    <form name=\"exampleform\" action=\"#\" method=\"get\" class=\"form-horizontal\">\n                                        <div class=\"control-group\">\n                                            <label class=\"control-label\">Email</label>\n                                            <div class=\"controls\">\n                                                ");
    stack1 = depth0;
    stack2 = "Ember.Textfield";
    stack3 = {};
    stack4 = "email";
    stack3['valueBinding'] = stack4;
    stack4 = helpers.view;
    tmp1 = {};
    tmp1.hash = stack3;
    tmp1.contexts = [];
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack4.call(depth0, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + "\n                                                <span class=\"help-inline\">Enter your email address</span>\n                                            </div>\n                                        </div>\n                                        <div class=\"control-group\">\n                                            <label class=\"control-label\">Password</label>\n                                            <div class=\"controls\">\n                                               ");
    stack1 = depth0;
    stack2 = "Ember.Textfield";
    stack3 = {};
    stack4 = "password";
    stack3['type'] = stack4;
    stack4 = "password";
    stack3['valueBinding'] = stack4;
    stack4 = helpers.view;
    tmp1 = {};
    tmp1.hash = stack3;
    tmp1.contexts = [];
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack4.call(depth0, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + "\n                                                <span class=\"help-inline\">Your password</span>\n                                            </div>\n                                        </div>\n                                         <div class=\"form-actions\">\n                                         <a class=\"btn\" ");
    stack1 = depth0;
    stack2 = "authenticate";
    stack3 = {};
    stack4 = "controller";
    stack3['target'] = stack4;
    stack4 = helpers.action;
    tmp1 = {};
    tmp1.hash = stack3;
    tmp1.contexts = [];
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack4.call(depth0, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + ">Log in</a>\n                                         <a class=\"btn\" ");
    stack1 = depth0;
    stack2 = "register";
    stack3 = helpers.action;
    tmp1 = {};
    tmp1.hash = {};
    tmp1.contexts = [];
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack3.call(depth0, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + ">click me</a>\n                                            <input type=\"submit\" class=\"btn btn-primary\" value=\"Login\" />\n                                               <button class=\"btn\" >Register</button>\n                                            </div>\n                                     </form>\n                                 </div>\n                             </div>\n                        </div>\n </div>");
    return buffer;
  });
   module.exports = module.id;
}});

window.require.define({"templates/layout/navigation": function(exports, require, module) {
  
  Ember.TEMPLATES[module.id] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Ember.Handlebars.helpers;
    var stack1, stack2, stack3, foundHelper, tmp1, self=this, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = '', stack1, stack2, stack3, stack4, stack5;
    data.buffer.push("\n<div class=\"span3 leftmenu\">\n\n<ul class=\"nav\">\n        <li>\n          <a href=\"#\">\n            <span class=\"ico\"><i class=\"icon-envelope\"></i></span><span class=\"text\">Messages</span>\n            <span class=\"indicator\"></span><b class=\"caret\"></b>\n          </a>\n          <ul >\n            <li>\n              <a ");
    stack1 = depth0;
    stack2 = "message";
    stack3 = depth0;
    stack4 = "doTransition";
    stack5 = helpers.action;
    tmp1 = {};
    tmp1.hash = {};
    tmp1.contexts = [];
    tmp1.contexts.push(stack3);
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack5.call(depth0, stack4, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + ">\n                  <span class=\"ico\"><i class=\"icon-play\"></i></span><span class=\"text\">Send Message</span>\n              </a>\n            </li>\n            <li>\n              <a ");
    stack1 = depth0;
    stack2 = "messages";
    stack3 = depth0;
    stack4 = "doTransition";
    stack5 = helpers.action;
    tmp1 = {};
    tmp1.hash = {};
    tmp1.contexts = [];
    tmp1.contexts.push(stack3);
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack5.call(depth0, stack4, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + ">\n                  <span class=\"ico\"><i class=\"icon-th\"></i></span><span class=\"text\">Sent Messages</span>\n             </a>\n            </li>\n          </ul>\n        </li>\n\n        <li>\n                  <a href=\"#\">\n                    <span class=\"ico\"><i class=\"icon-tags\"></i></span><span class=\"text\">Tags</span>\n                    <span class=\"indicator\"></span></b>\n                  </a>\n                  <ul >\n                    <li>\n                     <a ");
    stack1 = depth0;
    stack2 = "tag";
    stack3 = depth0;
    stack4 = "doTransition";
    stack5 = helpers.action;
    tmp1 = {};
    tmp1.hash = {};
    tmp1.contexts = [];
    tmp1.contexts.push(stack3);
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack5.call(depth0, stack4, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + ">\n                          <span class=\"ico\"><i class=\"icon-play\"></i></span><span class=\"text\">Add Tag</span>\n                      </a>\n                    </li>\n                    <li ");
    stack1 = depth0;
    stack2 = "tags";
    stack3 = depth0;
    stack4 = "doTransition";
    stack5 = helpers.action;
    tmp1 = {};
    tmp1.hash = {};
    tmp1.contexts = [];
    tmp1.contexts.push(stack3);
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack5.call(depth0, stack4, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + ">\n                      <a>\n                          <span class=\"ico\"><i class=\"icon-th\"></i></span><span class=\"text\">All Tags</span>\n                      </a>\n                    </li>\n                  </ul>\n                </li>\n                <li>\n                  <a href=\"#\">\n                    <span class=\"ico\"><i class=\"icon-map-marker\"></i></span><span class=\"text\">Geo Zones</span>\n                    <span class=\"indicator\"></span>\n                  </a>\n                  <ul >\n                    <li>\n                      <a ");
    stack1 = depth0;
    stack2 = "geoZone";
    stack3 = depth0;
    stack4 = "doTransition";
    stack5 = helpers.action;
    tmp1 = {};
    tmp1.hash = {};
    tmp1.contexts = [];
    tmp1.contexts.push(stack3);
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack5.call(depth0, stack4, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + ">\n                          <span class=\"ico\"><i class=\"icon-play\"></i></span><span class=\"text\">Add Geo Zone</span>\n                      </a>\n                    </li>\n                    <li>\n                      <a ");
    stack1 = depth0;
    stack2 = "geoZones";
    stack3 = depth0;
    stack4 = "doTransition";
    stack5 = helpers.action;
    tmp1 = {};
    tmp1.hash = {};
    tmp1.contexts = [];
    tmp1.contexts.push(stack3);
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack5.call(depth0, stack4, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + ">\n                        <span class=\"ico\"><i class=\"icon-th\"></i></span><span class=\"text\">All Geo Zones</span>\n                      </a>\n                    </li>\n                  </ul>\n                </li>\n                 <li>\n                     <a href=\"#\">\n                        <span class=\"ico\"><i class=\"icon-map-marker\"></i></span><span class=\"text\">Device</span>\n                        <span class=\"indicator\"></span>\n                     </a>\n                     <ul >\n                        <li>\n                           <a ");
    stack1 = depth0;
    stack2 = "device";
    stack3 = depth0;
    stack4 = "doTransition";
    stack5 = helpers.action;
    tmp1 = {};
    tmp1.hash = {};
    tmp1.contexts = [];
    tmp1.contexts.push(stack3);
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack5.call(depth0, stack4, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + ">\n                                <span class=\"ico\"><i class=\"icon-play\"></i></span><span class=\"text\">Lock Device</span>\n                           </a>\n                        </li>\n\n                     </ul>\n                 </li>\n</ul>\n</div>\n");
    return buffer;}

    stack1 = depth0;
    stack2 = "authenticated";
    stack3 = helpers['if'];
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.contexts = [];
    tmp1.contexts.push(stack1);
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    tmp1.data = data;
    stack1 = stack3.call(depth0, stack2, tmp1);
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    else { data.buffer.push(''); }
  });
   module.exports = module.id;
}});

window.require.define({"templates/layout/userNav": function(exports, require, module) {
  
  Ember.TEMPLATES[module.id] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Ember.Handlebars.helpers;
    var buffer = '', stack1, stack2, stack3, foundHelper, tmp1, self=this, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = '', stack1, stack2, stack3;
    data.buffer.push("\n<div id=\"userinfo\" class=\"column\">\n            <a class=\"userinfo dropown-toggle\" data-toggle=\"dropdown\" href=\"#\">\n                <span><strong>");
    stack1 = depth0;
    stack2 = "userName";
    stack3 = helpers._triageMustache;
    tmp1 = {};
    tmp1.hash = {};
    tmp1.contexts = [];
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack3.call(depth0, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + "</strong></span>\n            </a>\n         <ul class=\"dropdown-menu\">\n            <li><a href=\"\"> <i class=\"icon-user\"></i>Profile </a> </li>\n            <li class=\"divider\"></li>\n            <li><a ");
    stack1 = depth0;
    stack2 = "logOut";
    stack3 = helpers.action;
    tmp1 = {};
    tmp1.hash = {};
    tmp1.contexts = [];
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack3.call(depth0, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + "><i class=\"icon-off\"></i>Logout</a></li>\n         </ul>\n</div>\n");
    return buffer;}

    stack1 = depth0;
    stack2 = "authenticated";
    stack3 = helpers['if'];
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.contexts = [];
    tmp1.contexts.push(stack1);
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    tmp1.data = data;
    stack1 = stack3.call(depth0, stack2, tmp1);
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n");
    return buffer;
  });
   module.exports = module.id;
}});

window.require.define({"templates/messages/message": function(exports, require, module) {
  
  Ember.TEMPLATES[module.id] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Ember.Handlebars.helpers;
    var foundHelper, self=this;


    data.buffer.push("<h1>This is the message template</h1>");
  });
   module.exports = module.id;
}});

window.require.define({"templates/messages/messages": function(exports, require, module) {
  
  Ember.TEMPLATES[module.id] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Ember.Handlebars.helpers;
    var buffer = '', foundHelper, self=this;


    return buffer;
  });
   module.exports = module.id;
}});

window.require.define({"templates/reg": function(exports, require, module) {
  
  Ember.TEMPLATES[module.id] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Ember.Handlebars.helpers;
    var buffer = '', stack1, stack2, stack3, stack4, foundHelper, tmp1, self=this, escapeExpression=this.escapeExpression;


    data.buffer.push(" <div class=\"row-fluid\">\n                        <div class=\"span12\">\n                            <div class=\"box alternate\">\n                                <div class=\"box-title\">\n                                    Login\n                                </div>\n                                <div class=\"box-content nopadding\">\n                                    <form name=\"exampleform\" action=\"#\" method=\"get\" class=\"form-horizontal\">\n                                        <div class=\"control-group\">\n                                            <label class=\"control-label\">Email</label>\n                                            <div class=\"controls\">\n                                                ");
    stack1 = depth0;
    stack2 = "Ember.Textfield";
    stack3 = {};
    stack4 = "email";
    stack3['valueBinding'] = stack4;
    stack4 = helpers.view;
    tmp1 = {};
    tmp1.hash = stack3;
    tmp1.contexts = [];
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack4.call(depth0, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + "\n                                                <span class=\"help-inline\">Enter your email address</span>\n                                            </div>\n                                        </div>\n                                        <div class=\"control-group\">\n                                            <label class=\"control-label\">Password</label>\n                                            <div class=\"controls\">\n                                               ");
    stack1 = depth0;
    stack2 = "Ember.Textfield";
    stack3 = {};
    stack4 = "password";
    stack3['type'] = stack4;
    stack4 = "password";
    stack3['valueBinding'] = stack4;
    stack4 = helpers.view;
    tmp1 = {};
    tmp1.hash = stack3;
    tmp1.contexts = [];
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack4.call(depth0, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + "\n                                                <span class=\"help-inline\">Your password</span>\n                                            </div>\n                                        </div>\n                                         <div class=\"form-actions\">\n                                         <a class=\"btn\" ");
    stack1 = depth0;
    stack2 = "authenticate";
    stack3 = {};
    stack4 = "controller";
    stack3['target'] = stack4;
    stack4 = helpers.action;
    tmp1 = {};
    tmp1.hash = stack3;
    tmp1.contexts = [];
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack4.call(depth0, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + ">Log in</a>\n                                         <a class=\"btn\" ");
    stack1 = depth0;
    stack2 = "register";
    stack3 = helpers.action;
    tmp1 = {};
    tmp1.hash = {};
    tmp1.contexts = [];
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack3.call(depth0, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + ">click me</a>\n                                            <input type=\"submit\" class=\"btn btn-primary\" value=\"Login\" />\n                                               <button class=\"btn\" >Register</button>\n                                            </div>\n                                     </form>\n                                 </div>\n                             </div>\n                        </div>\n </div>");
    return buffer;
  });
   module.exports = module.id;
}});

window.require.define({"templates/users/user": function(exports, require, module) {
  
  Ember.TEMPLATES[module.id] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Ember.Handlebars.helpers;
    var foundHelper, self=this;


    data.buffer.push("<h1>user view!!</h1>");
  });
   module.exports = module.id;
}});

window.require.define({"views": function(exports, require, module) {
  // load all your views here

  require('views/application');
  require('views/messages/message');
  require('views/messages/messages');
  require('views/auth');
  require('views/reg');
  require('views/users/user');
  require('views/layout/userNav');
  require('views/layout/navigation');
  require('views/devices/device');
}});

window.require.define({"views/application": function(exports, require, module) {
  var App = require('app');

  App.ApplicationView = Em.View.extend({
      templateName: require('templates/application')
  });
}});

window.require.define({"views/auth": function(exports, require, module) {
  var App = require('app');
  App.AuthView=Em.View.extend({
      templateName:require('templates/auth')
  });
  
}});

window.require.define({"views/devices/device": function(exports, require, module) {
  /**
   * Created with JetBrains WebStorm.
   * User: user
   * Date: 1/7/13
   * Time: 2:31 PM
   * To change this template use File | Settings | File Templates.
   */
  
}});

window.require.define({"views/layout/navigation": function(exports, require, module) {
  var App=require('app');

  App.NavigationView=Em.View.extend({
      templateName:require('templates/navigation')
  });
}});

window.require.define({"views/layout/userNav": function(exports, require, module) {
  var App=require('app');
  App.UserNavView=Em.View.extend({
      templateName:require('templates/userNav')
  });
}});

window.require.define({"views/messages/message": function(exports, require, module) {
  var App = require('app');
}});

window.require.define({"views/messages/messages": function(exports, require, module) {
  /**
   * Created with JetBrains WebStorm.
   * User: user
   * Date: 1/7/13
   * Time: 1:36 PM
   * To change this template use File | Settings | File Templates.
   */
  
}});

window.require.define({"views/reg": function(exports, require, module) {
  var App=require('app');
  App.RegView=Em.View.extend({
      templateName:require('templates/reg')
  });
}});

window.require.define({"views/users/user": function(exports, require, module) {
  /**
   * Created with JetBrains WebStorm.
   * User: user
   * Date: 1/7/13
   * Time: 1:16 PM
   * To change this template use File | Settings | File Templates.
   */
  
}});

