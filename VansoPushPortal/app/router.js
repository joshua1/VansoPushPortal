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
