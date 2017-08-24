import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import {check} from "meteor/check";
import { FAQs, FAQCategories } from "../../both/collections/faqs.collection";
import { FAQ, FAQCategory } from "../../both/models/faqs.model";

interface Options {
    [key: string]: any;
}

Meteor.methods({
  "faqs.find": () => {
      let questions = FAQs.collection.find({}).fetch();
      let categories = FAQCategories.collection.find().fetch();
      let question = [];
      for (let i=0; i<categories.length; i++) {
        let categoryId = categories[i] ["_id"];
        let questionset = questions.filter(function(obj){
          return obj.categoryId == categoryId;
        });
        categories[i] ["questionset"] = questionset;
      }
      return categories;
  },
})
