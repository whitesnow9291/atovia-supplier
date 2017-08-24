import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import {Page} from "../models/page.model";

export const Pages = new MongoObservable.Collection<Page>("pages");
