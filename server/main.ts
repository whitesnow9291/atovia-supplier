import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import './startup/accounts-config';
import './imports/publications/users';
import './imports/routers/paypal.routes';
import './imports/routers/places.routes';
import './imports/routers/customer.routes';
import './startup/email-config';

Meteor.startup(() => {
  // send email notification to admin for tours approval
  Meteor.setInterval(() => {
    Meteor.call("tours.requestApproval");
  }, 5 * 60 * 1000)
});
