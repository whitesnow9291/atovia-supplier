import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';

/* check whether user is logged-in */
export function isLoggedIn() {
    if (! Meteor.userId()) {
        throw new Meteor.Error(403, "You must be logged-in to access this method.");
    }
    return true;
}

/* check whether user is having specific role */
export function userIsInRole(roles: string[]) {
    /* check login first */
    isLoggedIn();

    if (! Roles.userIsInRole(Meteor.userId(), roles) ) {
        throw new Meteor.Error(403, "You don't have permissions to access this method.");
    }
    return true;
}
