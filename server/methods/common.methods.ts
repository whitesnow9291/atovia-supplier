import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { check } from "meteor/check";
import { Email } from 'meteor/email';

Meteor.methods({
  "sendEmail": (to: string, subject: string, html: string) => {
      let from = "atorvia12@gmail.com";
      return Email.send({ to, from, subject, html});
  },
  "sendEmailCustom": (to: string, subject: string, text: string) => {
      let mailgunKey = Meteor.settings.public["mailgun"] ["key"];
      let mailgunDomain = Meteor.settings.public["mailgun"] ["domain"];
      let mailgun = require('mailgun-js')({apiKey: mailgunKey, domain: mailgunDomain});

      let data = {
        from: `noreply@${mailgunDomain}`,
        to: to,
        subject: subject,
        html: text
      }

      mailgun.messages().send(data, (err) => {
        if (err) {
          console.log(err);
        }
      });
  }
});
