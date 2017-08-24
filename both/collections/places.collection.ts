import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { Place } from "../models/place.model";

export const Places = new MongoObservable.Collection<Place>("places");
