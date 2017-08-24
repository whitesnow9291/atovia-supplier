import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { Tour } from "../models/tour.model";

export const Tours = new MongoObservable.Collection<Tour>("tours");
