import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { Transaction } from "../models/transaction.model";

export const Transactions = new MongoObservable.Collection<Transaction>("transactions");
