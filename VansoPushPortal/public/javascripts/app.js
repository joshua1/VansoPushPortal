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

window.require.define({"app": function(exports, require, module) {
  // Application bootstrapper

  module.exports = Em.Application.create();
  
}});

window.require.define({"controllers": function(exports, require, module) {
  // load all your controllers here

  require('controllers/application');
  require('controllers/home');
  require('controllers/bob');
  
}});

window.require.define({"controllers/application": function(exports, require, module) {
  var App = require('app');

  App.ApplicationController = Em.Controller.extend({
      
  });
}});

window.require.define({"controllers/bob": function(exports, require, module) {
  var App = require('app');

  App.BobController = Em.ObjectController.extend({

  });
}});

window.require.define({"controllers/home": function(exports, require, module) {
  var App = require('app');

  App.HomeController = Em.Controller.extend({
      
  });
}});

window.require.define({"initialize": function(exports, require, module) {
  
  window.App = require('app');

  require('templates');
  require('models');
  require('controllers');
  require('views');
  require('router');

  App.initialize();
  
}});

window.require.define({"models": function(exports, require, module) {
  // load all your models here

  require('models/bob');
}});

window.require.define({"models/bob": function(exports, require, module) {
  var App = require('app');

  App.BobModel = Em.Object.extend({

      firstName : null,
      lastName  : null,
      lyrics    : null,

      fullName: function(){
          return this.get('firstName') + ' ' + this.get('lastName');
      }.property('firstName', 'lastName')

  });
}});

window.require.define({"router": function(exports, require, module) {
  var App = require('app');

  App.Router = Em.Router.extend({
      
      enableLogging: true,

      root: Em.Route.extend({
          
          index: Em.Route.extend({
              route: '/',
              redirectsTo: 'home'
          }),

          home: Em.Route.extend({
              route: '/home',
              
              doBob: function(router, event){
                  router.transitionTo('bob');
              },

              connectOutlets: function(router, context){
                  router.get('applicationController').connectOutlet('home');
              }
          }),

          bob: Em.Route.extend({
              route: '/bob',

              doHome: function(router, event){
                  router.transitionTo('home');
              },

              connectOutlets: function(router, context){

                  var theMan = App.BobModel.create().setProperties({
                      firstName: 'bob',
                      lastName: 'marley',
                      lyrics: 'no woman no cry!'
                  });

                  router.get('applicationController').connectOutlet('bob', theMan);
              }
          })
      })
  })
}});

window.require.define({"templates": function(exports, require, module) {
  // load all your templates here

  require('templates/application');
  require('templates/home');
  require('templates/bob');
  
}});

window.require.define({"templates/application": function(exports, require, module) {
  
  Ember.TEMPLATES[module.id] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Ember.Handlebars.helpers;
    var buffer = '', stack1, stack2, stack3, foundHelper, tmp1, self=this, escapeExpression=this.escapeExpression;


    data.buffer.push("<div class=\"container\">\n    <h1>ApplicationView</h1>\n    <div class=\"well\">\n        ");
    stack1 = depth0;
    stack2 = "outlet";
    stack3 = helpers._triageMustache;
    tmp1 = {};
    tmp1.hash = {};
    tmp1.contexts = [];
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack3.call(depth0, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + "\n    </div>\n</div>");
    return buffer;
  });
   module.exports = module.id;
}});

window.require.define({"templates/bob": function(exports, require, module) {
  
  Ember.TEMPLATES[module.id] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Ember.Handlebars.helpers;
    var buffer = '', stack1, stack2, stack3, stack4, foundHelper, tmp1, self=this, escapeExpression=this.escapeExpression;


    data.buffer.push("<h2>");
    stack1 = depth0;
    stack2 = "fullName";
    stack3 = helpers._triageMustache;
    tmp1 = {};
    tmp1.hash = {};
    tmp1.contexts = [];
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack3.call(depth0, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + "'s page!</h2>\n<a class=\"btn btn-success\" ");
    stack1 = depth0;
    stack2 = "doClick";
    stack3 = {};
    stack4 = "view";
    stack3['target'] = stack4;
    stack4 = helpers.action;
    tmp1 = {};
    tmp1.hash = stack3;
    tmp1.contexts = [];
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack4.call(depth0, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + ">click me</a>\n<a class=\"btn\" ");
    stack1 = depth0;
    stack2 = "doHome";
    stack3 = helpers.action;
    tmp1 = {};
    tmp1.hash = {};
    tmp1.contexts = [];
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack3.call(depth0, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + ">go back home</a>");
    return buffer;
  });
   module.exports = module.id;
}});

window.require.define({"templates/home": function(exports, require, module) {
  
  Ember.TEMPLATES[module.id] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Ember.Handlebars.helpers;
    var buffer = '', stack1, stack2, stack3, foundHelper, tmp1, self=this, escapeExpression=this.escapeExpression;


    data.buffer.push("<h2>You are on the home page</h2>\n<a class=\"btn\" ");
    stack1 = depth0;
    stack2 = "doBob";
    stack3 = helpers.action;
    tmp1 = {};
    tmp1.hash = {};
    tmp1.contexts = [];
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack3.call(depth0, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + ">go to bob's page</a>");
    return buffer;
  });
   module.exports = module.id;
}});

window.require.define({"views": function(exports, require, module) {
  // load all your views here

  require('views/application');
  require('views/home');
  require('views/bob');
}});

window.require.define({"views/application": function(exports, require, module) {
  var App = require('app');

  App.ApplicationView = Em.View.extend({
      templateName: require('templates/application')
  });
}});

window.require.define({"views/bob": function(exports, require, module) {
  var App = require('app');

  App.BobView = Em.View.extend({

      templateName: require('templates/bob'),

      doClick: function(router, event){
          alert(this.get('controller.lyrics'));
      }
  });
}});

window.require.define({"views/home": function(exports, require, module) {
  var App = require('app');

  App.HomeView = Em.View.extend({
      templateName: require('templates/home')
  });
  
}});

