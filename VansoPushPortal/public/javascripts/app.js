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
                          console.log('authenticated');
                          router.transitionTo('authenticated');
                      } else {
                          console.log('not authenticated');
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


    data.buffer.push("<div class=\"container-fluid nopadding\">\n<div class=\"row-fluid\">\n    <div class=\"span12\">\n      <div id=\"header\">\n        <a href=\"#\" class=\"logo\">\n            <img alt=\"\" src=\"data:image/png;base64,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\" />\n        </a>\n        <div class=\"hright\">\n            ");
    stack1 = depth0;
    stack2 = "App.UserNavView";
    stack3 = helpers.view;
    tmp1 = {};
    tmp1.hash = {};
    tmp1.contexts = [];
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack3.call(depth0, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + "\n\n        </div>\n      </div>\n    </div>\n  </div>\n  </div>\n </div>\n  <div class=\"container-fluid\" id=\"container\">\n    <div class=\"row-fluid\">\n    <h1>hello WOrld</h1>\n           ");
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
    data.buffer.push(escapeExpression(stack1) + "\n          </div>\n\n        </div>\n    <footer>\n    </footer>\n    </div>\n   </div>\n");
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
      templateName:require('templates/layout/navigation')
  });
}});

window.require.define({"views/layout/userNav": function(exports, require, module) {
  var App=require('app');
  App.UserNavView=Em.View.extend({
      templateName:require('templates/layout/userNav')
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

