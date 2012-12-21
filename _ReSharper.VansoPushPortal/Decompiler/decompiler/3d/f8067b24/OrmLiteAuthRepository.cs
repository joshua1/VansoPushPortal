// Type: ServiceStack.ServiceInterface.Auth.OrmLiteAuthRepository
// Assembly: ServiceStack.ServiceInterface, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null
// Assembly location: \\vmware-host\shared folders\documents\visual studio 2010\Projects\VansoPushPortal\packages\ServiceStack.3.9.32\lib\net35\ServiceStack.ServiceInterface.dll

using ServiceStack.Common;
using ServiceStack.OrmLite;
using ServiceStack.Text;
using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text.RegularExpressions;

namespace ServiceStack.ServiceInterface.Auth
{
  public class OrmLiteAuthRepository : IUserAuthRepository, IClearable
  {
    public Regex ValidUserNameRegEx = new Regex("^(?=.{3,15}$)([A-Za-z0-9][._-]?)*$", RegexOptions.Compiled);
    private readonly IDbConnectionFactory dbFactory;

    public OrmLiteAuthRepository(IDbConnectionFactory dbFactory)
    {
      this.dbFactory = dbFactory;
    }

    public void CreateMissingTables()
    {
      OrmLiteConnectionFactoryExtensions.Run(this.dbFactory, (Action<IDbConnection>) (db =>
      {
        OrmLiteWriteConnectionExtensions.CreateTable<UserAuth>(db, false);
        OrmLiteWriteConnectionExtensions.CreateTable<UserOAuthProvider>(db, false);
      }));
    }

    public void DropAndReCreateTables()
    {
      OrmLiteConnectionFactoryExtensions.Run(this.dbFactory, (Action<IDbConnection>) (db =>
      {
        OrmLiteWriteConnectionExtensions.CreateTable<UserAuth>(db, true);
        OrmLiteWriteConnectionExtensions.CreateTable<UserOAuthProvider>(db, true);
      }));
    }

    private void ValidateNewUser(UserAuth newUser, string password)
    {
      AssertExtensions.ThrowIfNull((object) newUser, "newUser");
      AssertExtensions.ThrowIfNullOrEmpty(password, "password");
      if (ServiceStack.Common.StringExtensions.IsNullOrEmpty(newUser.UserName) && ServiceStack.Common.StringExtensions.IsNullOrEmpty(newUser.Email))
        throw new ArgumentNullException("UserName or Email is required");
      if (!ServiceStack.Common.StringExtensions.IsNullOrEmpty(newUser.UserName) && !this.ValidUserNameRegEx.IsMatch(newUser.UserName))
        throw new ArgumentException("UserName contains invalid characters", "UserName");
    }

    public UserAuth CreateUserAuth(UserAuth newUser, string password)
    {
      this.ValidateNewUser(newUser, password);
      return OrmLiteConnectionFactoryExtensions.Run<UserAuth>(this.dbFactory, (Func<IDbConnection, UserAuth>) (db =>
      {
        OrmLiteAuthRepository.AssertNoExistingUser(db, newUser, (UserAuth) null);
        string local_2;
        string local_1;
        new SaltedHash().GetHashAndSaltString(password, out local_2, out local_1);
        newUser.DigestHA1Hash = new DigestAuthFunctions().CreateHa1(newUser.UserName, DigestAuthProvider.Realm, password);
        newUser.PasswordHash = local_2;
        newUser.Salt = local_1;
        newUser.CreatedDate = DateTime.UtcNow;
        newUser.ModifiedDate = newUser.CreatedDate;
        OrmLiteWriteConnectionExtensions.Insert<UserAuth>(db, new UserAuth[1]
        {
          newUser
        });
        newUser = OrmLiteReadConnectionExtensions.GetById<UserAuth>(db, (object) OrmLiteReadConnectionExtensions.GetLastInsertId(db));
        return newUser;
      }));
    }

    private static void AssertNoExistingUser(IDbConnection db, UserAuth newUser, UserAuth exceptForExistingUser = null)
    {
      if (newUser.UserName != null)
      {
        UserAuth userAuthByUserName = OrmLiteAuthRepository.GetUserAuthByUserName(db, newUser.UserName);
        if (userAuthByUserName != null && (exceptForExistingUser == null || userAuthByUserName.Id != exceptForExistingUser.Id))
          throw new ArgumentException(ServiceStack.Text.StringExtensions.Fmt("User {0} already exists", new object[1]
          {
            (object) newUser.UserName
          }));
      }
      if (newUser.Email == null)
        return;
      UserAuth userAuthByUserName1 = OrmLiteAuthRepository.GetUserAuthByUserName(db, newUser.Email);
      if (userAuthByUserName1 == null || exceptForExistingUser != null && userAuthByUserName1.Id == exceptForExistingUser.Id)
        return;
      throw new ArgumentException(ServiceStack.Text.StringExtensions.Fmt("Email {0} already exists", new object[1]
      {
        (object) newUser.Email
      }));
    }

    public UserAuth UpdateUserAuth(UserAuth existingUser, UserAuth newUser, string password)
    {
      this.ValidateNewUser(newUser, password);
      return OrmLiteConnectionFactoryExtensions.Run<UserAuth>(this.dbFactory, (Func<IDbConnection, UserAuth>) (db =>
      {
        OrmLiteAuthRepository.AssertNoExistingUser(db, newUser, existingUser);
        string local_0 = existingUser.PasswordHash;
        string local_1 = existingUser.Salt;
        if (password != null)
          new SaltedHash().GetHashAndSaltString(password, out local_0, out local_1);
        string local_3 = existingUser.DigestHA1Hash;
        if (password != null || existingUser.UserName != newUser.UserName)
          local_3 = new DigestAuthFunctions().CreateHa1(newUser.UserName, DigestAuthProvider.Realm, password);
        newUser.Id = existingUser.Id;
        newUser.PasswordHash = local_0;
        newUser.Salt = local_1;
        newUser.DigestHA1Hash = local_3;
        newUser.CreatedDate = existingUser.CreatedDate;
        newUser.ModifiedDate = DateTime.UtcNow;
        OrmLiteWriteConnectionExtensions.Save<UserAuth>(db, newUser);
        return newUser;
      }));
    }

    public UserAuth GetUserAuthByUserName(string userNameOrEmail)
    {
      return OrmLiteConnectionFactoryExtensions.Run<UserAuth>(this.dbFactory, (Func<IDbConnection, UserAuth>) (db => OrmLiteAuthRepository.GetUserAuthByUserName(db, userNameOrEmail)));
    }

    private static UserAuth GetUserAuthByUserName(IDbConnection db, string userNameOrEmail)
    {
      // ISSUE: object of a compiler-generated type is created
      // ISSUE: variable of a compiler-generated type
      OrmLiteAuthRepository.\u003C\u003Ec__DisplayClassd cDisplayClassd = new OrmLiteAuthRepository.\u003C\u003Ec__DisplayClassd();
      // ISSUE: reference to a compiler-generated field
      cDisplayClassd.userNameOrEmail = userNameOrEmail;
      UserAuth userAuth;
      // ISSUE: reference to a compiler-generated field
      if (!cDisplayClassd.userNameOrEmail.Contains("@"))
      {
        IDbConnection dbConn = db;
        ParameterExpression parameterExpression = Expression.Parameter(typeof (UserAuth), "q");
        // ISSUE: method reference
        // ISSUE: field reference
        // ISSUE: method reference
        Expression<Func<UserAuth, bool>> predicate = Expression.Lambda<Func<UserAuth, bool>>((Expression) Expression.Equal((Expression) Expression.Property((Expression) parameterExpression, (MethodInfo) MethodBase.GetMethodFromHandle(__methodref (UserAuth.get_UserName))), (Expression) Expression.Field((Expression) Expression.Constant((object) cDisplayClassd), FieldInfo.GetFieldFromHandle(__fieldref (OrmLiteAuthRepository.\u003C\u003Ec__DisplayClassd.userNameOrEmail))), false, (MethodInfo) MethodBase.GetMethodFromHandle(__methodref (string.op_Equality))), new ParameterExpression[1]
        {
          parameterExpression
        });
        userAuth = Enumerable.FirstOrDefault<UserAuth>((IEnumerable<UserAuth>) ReadConnectionExtensions.Select<UserAuth>(dbConn, predicate));
      }
      else
      {
        IDbConnection dbConn = db;
        ParameterExpression parameterExpression = Expression.Parameter(typeof (UserAuth), "q");
        // ISSUE: method reference
        // ISSUE: field reference
        // ISSUE: method reference
        Expression<Func<UserAuth, bool>> predicate = Expression.Lambda<Func<UserAuth, bool>>((Expression) Expression.Equal((Expression) Expression.Property((Expression) parameterExpression, (MethodInfo) MethodBase.GetMethodFromHandle(__methodref (UserAuth.get_Email))), (Expression) Expression.Field((Expression) Expression.Constant((object) cDisplayClassd), FieldInfo.GetFieldFromHandle(__fieldref (OrmLiteAuthRepository.\u003C\u003Ec__DisplayClassd.userNameOrEmail))), false, (MethodInfo) MethodBase.GetMethodFromHandle(__methodref (string.op_Equality))), new ParameterExpression[1]
        {
          parameterExpression
        });
        userAuth = Enumerable.FirstOrDefault<UserAuth>((IEnumerable<UserAuth>) ReadConnectionExtensions.Select<UserAuth>(dbConn, predicate));
      }
      return userAuth;
    }

    public bool TryAuthenticate(string userName, string password, out UserAuth userAuth)
    {
      userAuth = this.GetUserAuthByUserName(userName);
      if (userAuth == null)
        return false;
      if (new SaltedHash().VerifyHashString(password, userAuth.PasswordHash, userAuth.Salt))
        return true;
      userAuth = (UserAuth) null;
      return false;
    }

    public bool TryAuthenticate(Dictionary<string, string> digestHeaders, string PrivateKey, int NonceTimeOut, string sequence, out UserAuth userAuth)
    {
      userAuth = this.GetUserAuthByUserName(digestHeaders["username"]);
      if (userAuth == null)
        return false;
      if (new DigestAuthFunctions().ValidateResponse(digestHeaders, PrivateKey, NonceTimeOut, userAuth.DigestHA1Hash, sequence))
        return true;
      userAuth = (UserAuth) null;
      return false;
    }

    public void LoadUserAuth(IAuthSession session, IOAuthTokens tokens)
    {
      AssertExtensions.ThrowIfNull((object) session, "session");
      UserAuth userAuth = this.GetUserAuth(session, tokens);
      this.LoadUserAuth(session, userAuth);
    }

    private void LoadUserAuth(IAuthSession session, UserAuth userAuth)
    {
      if (userAuth == null)
        return;
      string id = session.Id;
      ServiceStack.Common.ReflectionExtensions.PopulateWith<IAuthSession, UserAuth>(session, userAuth);
      session.Id = id;
      session.UserAuthId = userAuth.Id.ToString((IFormatProvider) CultureInfo.InvariantCulture);
      session.ProviderOAuthAccess = this.GetUserOAuthProviders(session.UserAuthId).ConvertAll<IOAuthTokens>((Converter<UserOAuthProvider, IOAuthTokens>) (x => (IOAuthTokens) x));
    }

    public UserAuth GetUserAuth(string userAuthId)
    {
      return OrmLiteConnectionFactoryExtensions.Run<UserAuth>(this.dbFactory, (Func<IDbConnection, UserAuth>) (db => OrmLiteReadConnectionExtensions.GetByIdOrDefault<UserAuth>(db, (object) userAuthId)));
    }

    public void SaveUserAuth(IAuthSession authSession)
    {
      OrmLiteConnectionFactoryExtensions.Run(this.dbFactory, (Action<IDbConnection>) (db =>
      {
        UserAuth local_0 = !ServiceStack.Common.StringExtensions.IsNullOrEmpty(authSession.UserAuthId) ? OrmLiteReadConnectionExtensions.GetByIdOrDefault<UserAuth>(db, (object) authSession.UserAuthId) : ServiceStack.Common.ReflectionExtensions.TranslateTo<UserAuth>((object) authSession);
        if (local_0.Id == 0 && !ServiceStack.Common.StringExtensions.IsNullOrEmpty(authSession.UserAuthId))
          local_0.Id = int.Parse(authSession.UserAuthId);
        local_0.ModifiedDate = DateTime.UtcNow;
        if (local_0.CreatedDate == new DateTime())
          local_0.CreatedDate = local_0.ModifiedDate;
        OrmLiteWriteConnectionExtensions.Save<UserAuth>(db, local_0);
      }));
    }

    public void SaveUserAuth(UserAuth userAuth)
    {
      userAuth.ModifiedDate = DateTime.UtcNow;
      if (userAuth.CreatedDate == new DateTime())
        userAuth.CreatedDate = userAuth.ModifiedDate;
      OrmLiteConnectionFactoryExtensions.Run(this.dbFactory, (Action<IDbConnection>) (db => OrmLiteWriteConnectionExtensions.Save<UserAuth>(db, userAuth)));
    }

    public List<UserOAuthProvider> GetUserOAuthProviders(string userAuthId)
    {
      int id = int.Parse(userAuthId);
      return Enumerable.ToList<UserOAuthProvider>((IEnumerable<UserOAuthProvider>) Enumerable.OrderBy<UserOAuthProvider, DateTime>((IEnumerable<UserOAuthProvider>) OrmLiteConnectionFactoryExtensions.Run<List<UserOAuthProvider>>(this.dbFactory, (Func<IDbConnection, List<UserOAuthProvider>>) (db =>
      {
        IDbConnection temp_19 = db;
        ParameterExpression local_0 = Expression.Parameter(typeof (UserOAuthProvider), "q");
        // ISSUE: method reference
        // ISSUE: field reference
        Expression<Func<UserOAuthProvider, bool>> temp_41 = Expression.Lambda<Func<UserOAuthProvider, bool>>((Expression) Expression.Equal((Expression) Expression.Property((Expression) local_0, (MethodInfo) MethodBase.GetMethodFromHandle(__methodref (UserOAuthProvider.get_UserAuthId))), (Expression) Expression.Field((Expression) Expression.Constant((object) this), FieldInfo.GetFieldFromHandle(__fieldref (OrmLiteAuthRepository.\u003C\u003Ec__DisplayClass1d.id)))), new ParameterExpression[1]
        {
          local_0
        });
        return ReadConnectionExtensions.Select<UserOAuthProvider>(temp_19, temp_41);
      })), (Func<UserOAuthProvider, DateTime>) (x => x.ModifiedDate)));
    }

    public UserAuth GetUserAuth(IAuthSession authSession, IOAuthTokens tokens)
    {
      if (!ServiceStack.Common.StringExtensions.IsNullOrEmpty(authSession.UserAuthId))
      {
        UserAuth userAuth = this.GetUserAuth(authSession.UserAuthId);
        if (userAuth != null)
          return userAuth;
      }
      if (!ServiceStack.Common.StringExtensions.IsNullOrEmpty(authSession.UserAuthName))
      {
        UserAuth userAuthByUserName = this.GetUserAuthByUserName(authSession.UserAuthName);
        if (userAuthByUserName != null)
          return userAuthByUserName;
      }
      if (tokens == null || ServiceStack.Common.StringExtensions.IsNullOrEmpty(tokens.Provider) || ServiceStack.Common.StringExtensions.IsNullOrEmpty(tokens.UserId))
        return (UserAuth) null;
      else
        return OrmLiteConnectionFactoryExtensions.Run<UserAuth>(this.dbFactory, (Func<IDbConnection, UserAuth>) (db =>
        {
          IDbConnection temp_38 = db;
          ParameterExpression local_2 = Expression.Parameter(typeof (UserOAuthProvider), "q");
          // ISSUE: method reference
          // ISSUE: field reference
          // ISSUE: method reference
          // ISSUE: method reference
          // ISSUE: method reference
          // ISSUE: field reference
          // ISSUE: method reference
          // ISSUE: method reference
          Expression<Func<UserOAuthProvider, bool>> temp_88 = Expression.Lambda<Func<UserOAuthProvider, bool>>((Expression) Expression.AndAlso((Expression) Expression.Equal((Expression) Expression.Property((Expression) local_2, (MethodInfo) MethodBase.GetMethodFromHandle(__methodref (UserOAuthProvider.get_Provider))), (Expression) Expression.Property((Expression) Expression.Field((Expression) Expression.Constant((object) this), FieldInfo.GetFieldFromHandle(__fieldref (OrmLiteAuthRepository.\u003C\u003Ec__DisplayClass20.tokens))), (MethodInfo) MethodBase.GetMethodFromHandle(__methodref (IOAuthTokens.get_Provider))), false, (MethodInfo) MethodBase.GetMethodFromHandle(__methodref (string.op_Equality))), (Expression) Expression.Equal((Expression) Expression.Property((Expression) local_2, (MethodInfo) MethodBase.GetMethodFromHandle(__methodref (UserOAuthProvider.get_UserId))), (Expression) Expression.Property((Expression) Expression.Field((Expression) Expression.Constant((object) this), FieldInfo.GetFieldFromHandle(__fieldref (OrmLiteAuthRepository.\u003C\u003Ec__DisplayClass20.tokens))), (MethodInfo) MethodBase.GetMethodFromHandle(__methodref (IOAuthTokens.get_UserId))), false, (MethodInfo) MethodBase.GetMethodFromHandle(__methodref (string.op_Equality)))), new ParameterExpression[1]
          {
            local_2
          });
          UserOAuthProvider local_0 = Enumerable.FirstOrDefault<UserOAuthProvider>((IEnumerable<UserOAuthProvider>) ReadConnectionExtensions.Select<UserOAuthProvider>(temp_38, temp_88));
          if (local_0 != null)
            return OrmLiteReadConnectionExtensions.GetByIdOrDefault<UserAuth>(db, (object) local_0.UserAuthId);
          else
            return (UserAuth) null;
        }));
    }

    public string CreateOrMergeAuthSession(IAuthSession authSession, IOAuthTokens tokens)
    {
      UserAuth userAuth = this.GetUserAuth(authSession, tokens) ?? new UserAuth();
      return OrmLiteConnectionFactoryExtensions.Run<string>(this.dbFactory, (Func<IDbConnection, string>) (db =>
      {
        IDbConnection temp_16 = db;
        ParameterExpression local_2 = Expression.Parameter(typeof (UserOAuthProvider), "q");
        // ISSUE: method reference
        // ISSUE: field reference
        // ISSUE: method reference
        // ISSUE: method reference
        // ISSUE: method reference
        // ISSUE: field reference
        // ISSUE: method reference
        // ISSUE: method reference
        Expression<Func<UserOAuthProvider, bool>> temp_66 = Expression.Lambda<Func<UserOAuthProvider, bool>>((Expression) Expression.AndAlso((Expression) Expression.Equal((Expression) Expression.Property((Expression) local_2, (MethodInfo) MethodBase.GetMethodFromHandle(__methodref (UserOAuthProvider.get_Provider))), (Expression) Expression.Property((Expression) Expression.Field((Expression) Expression.Constant((object) this), FieldInfo.GetFieldFromHandle(__fieldref (OrmLiteAuthRepository.\u003C\u003Ec__DisplayClass24.tokens))), (MethodInfo) MethodBase.GetMethodFromHandle(__methodref (IOAuthTokens.get_Provider))), false, (MethodInfo) MethodBase.GetMethodFromHandle(__methodref (string.op_Equality))), (Expression) Expression.Equal((Expression) Expression.Property((Expression) local_2, (MethodInfo) MethodBase.GetMethodFromHandle(__methodref (UserOAuthProvider.get_UserId))), (Expression) Expression.Property((Expression) Expression.Field((Expression) Expression.Constant((object) this), FieldInfo.GetFieldFromHandle(__fieldref (OrmLiteAuthRepository.\u003C\u003Ec__DisplayClass24.tokens))), (MethodInfo) MethodBase.GetMethodFromHandle(__methodref (IOAuthTokens.get_UserId))), false, (MethodInfo) MethodBase.GetMethodFromHandle(__methodref (string.op_Equality)))), new ParameterExpression[1]
        {
          local_2
        });
        UserOAuthProvider local_0 = Enumerable.FirstOrDefault<UserOAuthProvider>((IEnumerable<UserOAuthProvider>) ReadConnectionExtensions.Select<UserOAuthProvider>(temp_16, temp_66));
        if (local_0 == null)
          local_0 = new UserOAuthProvider()
          {
            Provider = tokens.Provider,
            UserId = tokens.UserId
          };
        local_0.PopulateMissing(tokens);
        userAuth.PopulateMissing(local_0);
        userAuth.ModifiedDate = DateTime.UtcNow;
        if (userAuth.CreatedDate == new DateTime())
          userAuth.CreatedDate = userAuth.ModifiedDate;
        OrmLiteWriteConnectionExtensions.Save<UserAuth>(db, userAuth);
        local_0.UserAuthId = userAuth.Id != 0 ? userAuth.Id : (int) OrmLiteReadConnectionExtensions.GetLastInsertId(db);
        if (local_0.CreatedDate == new DateTime())
          local_0.CreatedDate = userAuth.ModifiedDate;
        local_0.ModifiedDate = userAuth.ModifiedDate;
        OrmLiteWriteConnectionExtensions.Save<UserOAuthProvider>(db, local_0);
        return local_0.UserAuthId.ToString((IFormatProvider) CultureInfo.InvariantCulture);
      }));
    }

    public void Clear()
    {
      OrmLiteConnectionFactoryExtensions.Run(this.dbFactory, (Action<IDbConnection>) (db =>
      {
        OrmLiteWriteConnectionExtensions.DeleteAll<UserAuth>(db);
        OrmLiteWriteConnectionExtensions.DeleteAll<UserOAuthProvider>(db);
      }));
    }
  }
}
