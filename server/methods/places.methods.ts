import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';
import { check } from "meteor/check";
import { Places } from "../../both/collections/places.collection";
import { Place } from "../../both/models/place.model";
import * as _ from 'underscore';

interface Options {
    [key: string]: any;
}

Meteor.methods({
    "places.findCountries": () => {
      return Places.collection.find({"active": true, "country": {$exists: false}}, {sort: {"sortOrder": 1, "name": 1}, fields: {name: 1}}).fetch();
    },
    /* find place and search */
    "places.find": (options: Options, criteria: any, searchString: string) => {
        let where:any = [];

        // exclude deleted items
        where.push({
            "$or": [{ deleted: false }, { deleted: { $exists: false } }]
        });

        // merge criteria to where
        if (! _.isEmpty(criteria)) {
            where.push(criteria);
        }

        // match search string
        if (typeof searchString === 'string' && searchString.length) {
            // allow search on firstName, lastName
            where.push({
                "$or": [
                    { "name": { $regex: `.*${searchString}.*`, $options: 'i' } },
                    /*{ "province": { $regex: `.*${searchString}.*`, $options: 'i' } },
                    { "country": { $regex: `.*${searchString}.*`, $options: 'i' } },
                    { "address": { $regex: `.*${searchString}.*`, $options: 'i' } }*/
                ]
            });
        }

        // restrict db fields to return
        _.extend(options, {
            //fields: {"emails.address": 1, "patient": 1, "createdAt": 1, "status": 1}
        });

        //console.log("where:", where);
        //console.log("options:", options);
        // execute find query
        let cursor = Places.collection.find({ $and: where }, options);
        return { count: cursor.count(), data: cursor.fetch() };

    }
})
