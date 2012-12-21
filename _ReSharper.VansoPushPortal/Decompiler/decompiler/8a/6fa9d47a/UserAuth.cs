// Type: ServiceStack.ServiceInterface.Auth.UserAuth
// Assembly: ServiceStack.ServiceInterface, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null
// Assembly location: \\vmware-host\shared folders\documents\visual studio 2010\Projects\VansoPushPortal\packages\ServiceStack.3.9.32\lib\net35\ServiceStack.ServiceInterface.dll

using ServiceStack.Common;
using ServiceStack.DataAnnotations;
using ServiceStack.Text;
using System;
using System.Collections.Generic;

namespace ServiceStack.ServiceInterface.Auth
{
  public class UserAuth
  {
    [AutoIncrement]
    public virtual int Id { get; set; }

    public virtual string UserName { get; set; }

    public virtual string Email { get; set; }

    public virtual string PrimaryEmail { get; set; }

    public virtual string FirstName { get; set; }

    public virtual string LastName { get; set; }

    public virtual string DisplayName { get; set; }

    public virtual DateTime? BirthDate { get; set; }

    public virtual string BirthDateRaw { get; set; }

    public virtual string Country { get; set; }

    public virtual string Culture { get; set; }

    public virtual string FullName { get; set; }

    public virtual string Gender { get; set; }

    public virtual string Language { get; set; }

    public virtual string MailAddress { get; set; }

    public virtual string Nickname { get; set; }

    public virtual string PostalCode { get; set; }

    public virtual string TimeZone { get; set; }

    public virtual string Salt { get; set; }

    public virtual string PasswordHash { get; set; }

    public virtual string DigestHA1Hash { get; set; }

    public virtual List<string> Roles { get; set; }

    public virtual List<string> Permissions { get; set; }

    public virtual DateTime CreatedDate { get; set; }

    public virtual DateTime ModifiedDate { get; set; }

    public virtual int? RefId { get; set; }

    public virtual string RefIdStr { get; set; }

    public virtual Dictionary<string, string> Meta { get; set; }

    public UserAuth()
    {
      this.Roles = new List<string>();
      this.Permissions = new List<string>();
    }

    public T Get<T>()
    {
      string str = (string) null;
      if (this.Meta != null)
        this.Meta.TryGetValue(typeof (T).Name, out str);
      if (str != null)
        return TypeSerializer.DeserializeFromString<T>(str);
      else
        return default (T);
    }

    public void Set<T>(T value)
    {
      if (this.Meta == null)
        this.Meta = new Dictionary<string, string>();
      this.Meta[typeof (T).Name] = TypeSerializer.SerializeToString<T>(value);
    }

    public virtual void PopulateMissing(UserOAuthProvider authProvider)
    {
      if (!ServiceStack.Common.StringExtensions.IsNullOrEmpty(authProvider.DisplayName) && ServiceStack.Common.StringExtensions.IsNullOrEmpty(this.DisplayName))
        this.DisplayName = authProvider.DisplayName;
      if (!ServiceStack.Common.StringExtensions.IsNullOrEmpty(authProvider.Email) && ServiceStack.Common.StringExtensions.IsNullOrEmpty(this.PrimaryEmail))
        this.PrimaryEmail = authProvider.Email;
      if (!ServiceStack.Common.StringExtensions.IsNullOrEmpty(authProvider.FirstName))
        this.FirstName = authProvider.FirstName;
      if (!ServiceStack.Common.StringExtensions.IsNullOrEmpty(authProvider.LastName))
        this.LastName = authProvider.LastName;
      if (!ServiceStack.Common.StringExtensions.IsNullOrEmpty(authProvider.FullName))
        this.FullName = authProvider.FullName;
      if (authProvider.BirthDate.HasValue)
        this.BirthDate = authProvider.BirthDate;
      if (!ServiceStack.Common.StringExtensions.IsNullOrEmpty(authProvider.BirthDateRaw))
        this.BirthDateRaw = authProvider.BirthDateRaw;
      if (!ServiceStack.Common.StringExtensions.IsNullOrEmpty(authProvider.Country))
        this.Country = authProvider.Country;
      if (!ServiceStack.Common.StringExtensions.IsNullOrEmpty(authProvider.Culture))
        this.Culture = authProvider.Culture;
      if (!ServiceStack.Common.StringExtensions.IsNullOrEmpty(authProvider.Gender))
        this.Gender = authProvider.Gender;
      if (!ServiceStack.Common.StringExtensions.IsNullOrEmpty(authProvider.MailAddress))
        this.MailAddress = authProvider.MailAddress;
      if (!ServiceStack.Common.StringExtensions.IsNullOrEmpty(authProvider.Nickname))
        this.Nickname = authProvider.Nickname;
      if (!ServiceStack.Common.StringExtensions.IsNullOrEmpty(authProvider.PostalCode))
        this.PostalCode = authProvider.PostalCode;
      if (ServiceStack.Common.StringExtensions.IsNullOrEmpty(authProvider.TimeZone))
        return;
      this.TimeZone = authProvider.TimeZone;
    }
  }
}
