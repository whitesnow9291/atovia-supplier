import { Injectable } from '@angular/core';
import { Meteor } from 'meteor/meteor';

@Injectable()
export class UserService {
  constructor() {
  }

  isLoggedIn() {
    return !!Meteor.userId();
  }
}