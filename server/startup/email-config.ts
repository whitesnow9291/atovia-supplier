import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Email } from 'meteor/email';
import * as _ from 'underscore';
Meteor.startup(() => {

  let sendDefault = <any>_.bind(Email.send, Email);
  _.extend(Email, {
    send: function (options) {
      let override = true;
      if (override) {
        /* your custom mail method, pull the options you need from `options` */
        // console.log('CUSTOM MAIL METHOD');
        Meteor.call("sendEmailCustom", options.to, options.subject, options.html);
      } else {
        /* use the SMTP method */
        // console.log('DEFAULT MAIL METHOD');
        sendDefault(options);
      }
    }
  });

  Accounts.emailTemplates.from = "Atorvia <atorvia12@gmail.com>";

  Accounts.emailTemplates.resetPassword.subject = function (user) {
    return "Reset Password Instructions";
  };
  Accounts.emailTemplates.resetPassword.html = function(user, url) {
    let myToken = user.services.password.reset.token;
    let url2 = `${process.env.ROOT_URL}/reset-password/${myToken}`;
    return `<h3>Change Password Request.</h3>
      <p>To reset your password click the link below.
      <p><a href="${url2}">${url2}</a></p>
      <p>Team Atorvia</p>`;
  };

  Accounts.emailTemplates.verifyEmail.subject = function (user) {
    return "Verify Your Account";
  };
  Accounts.emailTemplates.verifyEmail.html = function(user, url) {
    let myToken = user.services.email.verificationTokens[0].token;
    let url2 = `${process.env.ROOT_URL}/verify-email/${myToken}`;
    return `<h3>Thank you for your registration.</h3>
      <p>To verify your email click the link below.
      <p><a href="${url2}">${url2}</a></p>
      <p>Team Atorvia</p>`;
  };

});
