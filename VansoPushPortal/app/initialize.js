
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
