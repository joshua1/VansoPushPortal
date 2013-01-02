using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.SessionState;
using Funq;
using ServiceModel;
using ServiceStack.CacheAccess;
using ServiceStack.CacheAccess.Providers;
using ServiceStack.Common.Web;
using ServiceStack.Configuration;
using ServiceStack.FluentValidation;
using ServiceStack.OrmLite;
using ServiceStack.OrmLite.SqlServer;
using ServiceStack.ServiceInterface;
using ServiceStack.ServiceInterface.Admin;
using ServiceStack.ServiceInterface.Auth;
using ServiceStack.WebHost.Endpoints;
using ServiceLogic;

namespace VansoPushPortal
{
    public class CustomRegistrationValidator : RegistrationValidator
    {
        public CustomRegistrationValidator()
        {
            RuleSet(ApplyTo.Post, () =>
            {
                RuleFor(x => x.DisplayName).NotEmpty();
            });
        }
    }
    /// <summary>
    /// Create your ServiceStack web service application with a singleton AppHost.
    /// </summary>
    /// 
    public class AppHost : AppHostBase
    {
        /// <summary>
        /// Initializes a new instance of your ServiceStack application, with the specified name and assembly containing the services.
        /// </summary>
        public AppHost()
            : base("Vanso Push Portal", typeof(MessageService).Assembly) { }
        
        /// <summary>
        /// Configure the container with the necessary routes for your ServiceStack application.
        /// </summary>
        /// <param name="container">The built-in IoC used with ServiceStack.</param>
        public override void Configure(Container container)
        {
            var appSettings = new AppSettings();
            var connString = appSettings.Get("SQLSERVER_CONNECTION_STRING",
                                             ConfigUtils.GetConnectionString("ApplicationServices"));
            container.Register<IDbConnectionFactory>(
                new OrmLiteConnectionFactory(connString, SqlServerDialect.Provider));
            
            //Using an in-memory cache
            container.Register<ICacheClient>(new MemoryCacheClient());
            ConfigureAuth(container);
            var dbFactory = container.Resolve<IDbConnectionFactory>();
            dbFactory.Run(d => d.CreateTableIfNotExists<UserAuth>());
            dbFactory.Run(db => db.CreateTableIfNotExists<Message>());
            dbFactory.Run(d => d.CreateTableIfNotExists<Device>());

            SetConfig(new EndpointHostConfig
            {
                //EnableFeatures = Feature.All.Remove(disableFeatures),
                AppendUtf8CharsetOnContentTypes = new HashSet<string> { ContentType.Json },
            });
            //Or if Haz Redis
            //container.Register<ICacheClient>(new PooledRedisClientManager());


        }

        private void ConfigureAuth(Container container)
        {
            var appSettings = new AppSettings();
            
            Plugins.Add(new AuthFeature(
               () => new AuthUserSession(), 
               new IAuthProvider[] {
                    new CredentialsAuthProvider(),              //HTML Form post of UserName/Password credentials
                    new BasicAuthProvider(),                    //Sign-in with Basic Auth
                }));

            //Provide service for new users to register so they can login with supplied credentials.
            Plugins.Add(new RegistrationFeature());
            //override the default registration validation with your own custom implementation
            container.RegisterAs<CustomRegistrationValidator, IValidator<Registration>>();
            
            //Store User Data into the referenced SqlServer database
           
            container.Register<IUserAuthRepository>(c =>
                 new OrmLiteAuthRepository(c.Resolve<IDbConnectionFactory>()));

            var userRep = (OrmLiteAuthRepository)container.Resolve<IUserAuthRepository>();
            //If using and RDBMS to persist UserAuth, we must create required tables
            if (appSettings.Get("RecreateAuthTables", false))
                userRep.DropAndReCreateTables(); //Drop and re-create all Auth and registration tables
            else
                userRep.CreateMissingTables();   //Create only the missing tables

            //Add a user for testing purposes
            string hash;
            string salt;
            string password = "Nomvete";
            new SaltedHash().GetHashAndSaltString(password, out hash, out salt);
            userRep.CreateUserAuth(new UserAuth
            {
                Id = 1,
                DisplayName = "DisplayName",
                Email = "as@if.com",
                UserName = "User1",
                FirstName = "FirstName",
                LastName = "LastName",
                PasswordHash = hash,
                Salt = salt,
            }, password);


          

            Plugins.Add(new RequestLogsFeature());
        }
    }
    public class Global : System.Web.HttpApplication
    {
        void Application_Start(object sender, EventArgs e)
        {
            (new AppHost()).Init();
        }
    }
}
