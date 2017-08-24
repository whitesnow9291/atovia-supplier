import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import {check} from "meteor/check";
import {Pages} from "../../both/collections/pages.collection";
import {Page} from "../../both/models/page.model";


interface Options {
  [key: string]: any;
}

Meteor.methods({

    "pages.find": (options: Options, criteria: any, searchString: string) => {
        let where:any = [];
        where.push({
            "$or": [{deleted: false}, {deleted: {$exists: false} }]
        }, {
          "$or": [{active: true}, {active: {$exists: false} }]
        });

        let cursor = Pages.collection.find({$and: where}, options);
        return {count: cursor.count(), data: cursor.fetch()};
    },
    "pages.findOne": (slug: string) => {
      let where:any = [];
      where.push({
          "$or": [{deleted: false}, {deleted: {$exists: false} }]
      }, {
        "$or": [{active: true}, {active: {$exists: false} }]
      });
      where.push({slug: slug});

      return Pages.collection.findOne({$and: where});
    }
});
