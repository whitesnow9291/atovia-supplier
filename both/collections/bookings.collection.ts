import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { Booking } from "../models/booking.model";

export const Bookings = new MongoObservable.Collection<Booking>("bookings");
