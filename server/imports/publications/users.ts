import { Meteor } from 'meteor/meteor';

Meteor.publish("users", function() {
    return Meteor.users.find(
      { _id: this.userId },
      { fields: {createdAt: 1, profile: 1, emails: 1} }
    );
});
