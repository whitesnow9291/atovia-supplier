import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { Payout } from "../models/payout.model";

export const Payouts = new MongoObservable.Collection<Payout>("payouts");
