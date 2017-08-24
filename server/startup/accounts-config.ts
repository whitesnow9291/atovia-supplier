import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import * as _ from 'underscore';

Accounts.onCreateUser(function(options, user) {
  // Use provided userData in options, or create an empty object
  // user profile
  if (typeof options.profile !== "undefined") {
    user.profile = options.profile || {};
    if (user.profile.firstName && user.profile.lastName && !user.profile.fullName) {
      user.profile.fullName = `${user.profile.firstName} ${user.profile.lastName}`;
    }
  } else {
    user.profile = {};
  }

  // user status
  if (typeof options.status !== "undefined") {
    user.status = options.status || {};
  }

  // set profile incase of fb login
  if (typeof user.services.facebook !== "undefined") {
    let fbData = user.services.facebook;
    user.profile = {
      fbId: fbData.id,
      fullName: fbData.name,
      firstName: fbData.first_name,
      lastName: fbData.last_name,
      age: fbData.age_range.min,
      gender: fbData.gender,
      supplier: {
        agentCertificate: {},
        agentIdentity: {}
      }
    }
  }

  // set user role
  user.roles = ['supplier'];

  // Returns the user object
  return user;
});

// remove login attempt limit
// Accounts.removeDefaultRateLimit();

// validate user role before login
Accounts.validateLoginAttempt(function (options) {
  if (options.user && options.allowed) {

    if ( options.user.deleted === true ) {
      throw new Meteor.Error(403, "You are not allowed to login.");
    }

    if ( options.user.active === false ) {
      throw new Meteor.Error(403, "Your account is deactivated.");
    }

    var isAdmin = Roles.userIsInRole(options.user, ['supplier'])
    if (!isAdmin) {
      throw new Meteor.Error(403, "Not authorized!");
    }

    let isVerified = true;
    if (options.methodArguments.length && !_.isEmpty(options.methodArguments[0].user) ) {
      let formEmail = options.methodArguments[0].user.email;
      let userEmails = options.user.emails;
      for(let i=0; i<userEmails.length; i++) {
        if (userEmails[i] ["address"] == formEmail && userEmails[i] ["verified"] != true) {
          isVerified = false;
        }
      }
    }

    if (!isVerified) {
      throw new Meteor.Error(403, "Your email isn’t verified. Please check your inbox to continue.");
    }
  }
  return true;
});

//validate the change password
Accounts.changePassword = function (oldpassword, newPassword) {
  if (!Meteor.user()) {
    throw new Meteor.Error("Must be logged-in to change password.");
  }

  check(newPassword, String);
  if (!newPassword) {
    throw new Meteor.Error(400, "Password should not be empty");
  }
}
Accounts.config({
  loginExpirationInDays: 30
})
