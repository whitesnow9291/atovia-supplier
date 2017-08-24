import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { check } from "meteor/check";
import { Bookings } from "../../both/collections/bookings.collection";
import { Booking } from "../../both/models/booking.model";
import { isLoggedIn, userIsInRole } from "../imports/services/auth";
import bookingCancellationAdminHtml from "../imports/emails/admin/booking-cancellation.html";
import bookingCancellationCustomerHtml from "../imports/emails/customer/booking-cancellation.html";
import bookingApprovalHtml from "../imports/emails/customer/booking-approved.html";
import bookingRefundCustomerHtml from "../imports/emails/customer/booking-refund.html";
import bookingRefundAdminHtml from "../imports/emails/admin/booking-refund.html";
import * as _ from 'underscore';

interface Options {
  [key: string]: any;
}

Meteor.methods({
    "bookings.find": (options: Options, criteria: any, searchString: any, count: boolean = false) => {
        userIsInRole(["supplier"]);

        let userId = Meteor.userId();
        let where:any = [];

        where.push({
            "$or": [{deleted: false}, {deleted: {$exists: false} }]
        }, {
          "$or": [{active: true}, {active: {$exists: false} }]
        }, {
          "tour.supplierId": userId,
          "paymentInfo.status": "approved"
        });

        if ( !_.isEmpty(criteria) ) {
          let today = new Date();
          today.setHours(0, 0, 0, 0);
          // console.log(today.toISOString());
          if ( criteria.confirmed == false ) { // pending
            criteria.startDate = {$gte: today};
            delete criteria["completed"];
          } else if ( criteria.completed==true ) { // completed
            criteria.startDate = {$lt: today};
            delete criteria["completed"];
            delete criteria["confirmed"];
          } else if ( criteria.completed==false && criteria.confirmed==true ) { // confirmed
            criteria["$or"] = [{confirmed: true}, {cancelled: true}];
            criteria.startDate = {$gte: today};
            delete criteria["confirmed"];
            delete criteria["completed"];
          }
          //console.log(criteria);
          where.push(criteria);
        }

        // match search string
        if (isNaN(searchString) == false && searchString.length) {
          searchString = Number(searchString);
          where.push({
              "$or": [{uniqueId: searchString}]
          });
        } else if (typeof searchString === 'string' && searchString.length) {
            // allow search on firstName, lastName
            where.push({
                "$or": [
                    { "_id": { $regex: `.*${searchString}.*`, $options: 'i' } },
                    { "tour.name": { $regex: `.*${searchString}.*`, $options: 'i' } },
                    { "user.firstName": { $regex: `.*${searchString}.*`, $options: 'i' } },
                    { "user.lastName": { $regex: `.*${searchString}.*`, $options: 'i' } },
                    { "travellers.firstName": { $regex: `.*${searchString}.*`, $options: 'i' } },
                    { "travellers.lastName": { $regex: `.*${searchString}.*`, $options: 'i' } }
                ]
            });
        }
        let cursor = Bookings.collection.find({$and: where}, options);

        if (count === true) {
          return cursor.count();
        }

        return {count: cursor.count(), data: cursor.fetch()};
    },
    "bookings.findOne": (criteria: any) => {
      userIsInRole(["supplier"]);

      let userId = Meteor.userId();
      let where:any = [];
      where.push({
          "$or": [{deleted: false}, {deleted: {$exists: false} }]
      }, {
        "$or": [{active: true}, {active: {$exists: false} }]
      }, {
        "tour.supplierId": userId,
        "paymentInfo.status": "approved"
      });

      if (_.isEmpty(criteria)) {
        criteria = { };
      }
      where.push(criteria);

      return Bookings.collection.findOne({$and: where});
    },
    "bookings.count": () => {
      userIsInRole(["supplier"]);

      let bookingsCount: any = {};
      bookingsCount.pending = Meteor.call("bookings.find", {}, {confirmed: false, cancelled: false, refunded: false}, "", true);
      bookingsCount.confirmed = Meteor.call("bookings.find", {}, {confirmed: true, completed: false, refunded: false}, "", true);
      bookingsCount.completed = Meteor.call("bookings.find", {}, {confirmed: true, cancelled: false, completed: true, refunded: false}, "", true);
      bookingsCount.cancelled = Meteor.call("bookings.find", {}, {refunded: true}, "", true);

      return bookingsCount;
    },
    "bookings.approve": (bookingId) => {
      userIsInRole(["supplier"]);

      let user = Meteor.user();
      let retVal = Bookings.collection.update({_id: bookingId, "tour.supplierId": user._id, "cancelled": false}, {$set: {confirmed: true, confirmedAt: new Date()} });

      //send email to customer
      Meteor.setTimeout(() => {
        Meteor.call("bookings.sendApprovedConfirmation", bookingId);
      }, 0);

      return retVal;
    },
    "bookings.cancel": (bookingId: string, userData: any) => {
      let dataToUpdate: any = {
        // confirmed: false,
        cancelled: true,
        cancelledAt: new Date(),
        cancellationReason: userData.reason,
        cancellationComments: userData.comments,
        cancelledBy: "supplier"
      };

      let retVal = Bookings.collection.update({_id: bookingId, cancelled: false}, { $set: dataToUpdate });

      //send email to customer and admin
      Meteor.setTimeout(() => {
        Meteor.call("bookings.sendCancelledConfirmation", bookingId);
      }, 0);

      return retVal;
    },
    "bookings.statistics": () => {
      userIsInRole(["supplier"]);

      let userId = Meteor.userId(),
          today = new Date(),
          oneDay = ( 1000 * 60 * 60 * 24 ),
          week6 = new Date( today.valueOf() - ( 5 * 7 * oneDay ) ),
          week5 = new Date( today.valueOf() - ( 4 * 7 * oneDay ) ),
          week4 = new Date( today.valueOf() - ( 3 * 7 * oneDay ) ),
          week3 = new Date( today.valueOf() - ( 2 * 7 * oneDay ) ),
          week2 = new Date( today.valueOf() - ( 1 * 7 * oneDay ) ),
          week1 = new Date( today.valueOf() - ( 0 * 7 * oneDay ) );

      let $cond = {
          "$cond": [
              { "$lte": [ "$bookingDate", week6 ] },
              "week6",
              { "$cond": [
                  { "$lte": [ "$bookingDate", week5 ] },
                  "week5",
                  { "$cond": [
                      { "$lte": [ "$bookingDate", week4 ] },
                      "week4",
                      { "$cond": [
                          { "$lte": [ "$bookingDate", week3 ] },
                          "week3",
                          { "$cond": [
                              { "$lte": [ "$bookingDate", week2 ] },
                              "week2",
                              "week1"
                          ]}
                      ]}
                  ]}
              ]}
          ]
      };

      let data = Bookings.collection.aggregate([
          { "$match": {
              "tour.supplierId": userId,
              "confirmed": true,
              "refunded": false,
              "bookingDate": { "$gte": week6 }
          }},
          { "$group": {
              "_id": $cond,
              "count": { "$sum": 1 },
              "totalValue": { "$sum": "$totalPriceDefault" }
          }}
      ]);

      let bookings = data;
      let bookingsCount = [];
      let bookingsValue = [];
      let groupNames = ["week1", "week2", "week3", "week4", "week5", "week6"];
      interface BookingStats {count: number; totalValue: number}
      for (let i=0; i<groupNames.length; i++) {
        let item: BookingStats = <BookingStats>_.find(bookings, {_id: groupNames[i]});
        if (_.isEmpty(item)) {
          bookingsCount.push(0);
          bookingsValue.push(0);
        } else {
          bookingsCount.push(item.count);
          bookingsValue.push(item.totalValue);
        }
      }

      return {bookingsCount, bookingsValue};
    },
    "bookings.statistics.new":(criteria: any = {}) => {
      userIsInRole(["supplier"]);
      // console.log(criteria);

      let userId = Meteor.userId(),
        today = new Date(),
        oneDay = ( 1000 * 60 * 60 * 24 ),
        _id: any = {"year":"$year","month":"$month","day":"$day"};

      let data = Bookings.collection.aggregate([
        {
        "$match":
          {
            "tour.supplierId": userId,
            "confirmed": true,
            "refunded": false
          }},
        {
        "$project":
          {
            "tour.supplierId":1,
            "totalPriceDefault":1,
            "month": {"$month":"$bookingDate"},
            "year": {"$year": "$bookingDate"},
            "day": {"$dayOfMonth": "$bookingDate"},
            "bookingDate": 1
          }},
        {
        "$match": criteria
          },
        {
        "$group":
          {
            _id,
            "totalPrice":{"$sum":"$totalPriceDefault"},
            "count":{"$sum":1}
          }},
          {
          "$sort":
           {
             "_id.year": 1, "_id.month": 1, "_id.day": 1
           }}
      ])
      return data;
    },
    "bookings.sendCancelledConfirmation": (bookingId) => {

      // find booking details
      let booking = Bookings.collection.findOne({_id: bookingId});
      if (_.isEmpty(booking)) {
        return;
      }

      // send email to Admin
      let admin = Meteor.users.findOne({"roles": "super-admin"}, {fields: {"emails": 1} });
      let adminAppUrl = Meteor.settings.public["adminAppUrl"];
      let to = admin.emails[0].address;
      let subject = "Booking Cancellation Confirmation - Admin";
      let text = eval('`'+bookingCancellationAdminHtml+'`');
      Meteor.setTimeout(() => {
        Meteor.call("sendEmail", to, subject, text)
      }, 0);

      // send email to customer
      let customerAppUrl = Meteor.settings.public["customerAppUrl"];
      to = booking.user.email;
      subject = "Booking Cancellation Confirmation - Customer";
      text = eval('`'+ bookingCancellationCustomerHtml +'`');
      Meteor.setTimeout(() => {
        Meteor.call("sendEmail", to, subject, text)
      }, 0);
    },
    "bookings.sendApprovedConfirmation": (bookingId) => {

      // find booking details
      let booking = Bookings.collection.findOne({_id: bookingId});
      if (_.isEmpty(booking)) {
        return;
      }

      let paymentMethod = booking.paymentInfo.method;
      if (paymentMethod == "express_checkout") {
        booking.paymentInfo.method = "Paypal";
      } else if(paymentMethod == "credit_card") {
        booking.paymentInfo.method = "Credit Card";
      }

      // send email to customer
      let customerAppUrl = Meteor.settings.public["customerAppUrl"];
      let to = booking.user.email;
      let subject = "Booking Approval Confirmation - Customer";
      let text = eval('`'+ bookingApprovalHtml +'`');
      Meteor.setTimeout(() => {
        Meteor.call("sendEmail", to, subject, text);
      }, 0);
    },
    "bookings.refundConfirmation": (bookingId) => {
      let fs = require("fs");

      // find booking details
      let booking = Bookings.collection.findOne({_id: bookingId});
      if (_.isEmpty(booking)) {
        return;
      }

      let paymentMethod = booking.paymentInfo.method;
      if (paymentMethod == "express_checkout") {
        booking.paymentInfo.method = "Paypal";
      } else if(paymentMethod == "credit_card") {
        booking.paymentInfo.method = "Credit Card";
      }

      // send email to customer
      let customerAppUrl = Meteor.settings.public["customerAppUrl"];
      let to = booking.user.email;
      let subject = "Booking Refund Confirmation - Customer";
      let text = eval('`'+ bookingRefundCustomerHtml +'`');
      Meteor.setTimeout(() => {
        Meteor.call("sendEmail", to, subject, text);
      }, 0);

      // send email to Admin
      let admin = Meteor.users.findOne({"roles": "super-admin"}, {fields: {"emails": 1} });
      let adminAppUrl = Meteor.settings.public["adminAppUrl"];
      to = admin.emails[0].address;
      subject = "Booking Refund Confirmation - Admin";
      text = eval('`'+ bookingRefundAdminHtml +'`');
      Meteor.setTimeout(() => {
        Meteor.call("sendEmail", to, subject, text)
      }, 0);
    }

});

function getFormattedDate(today) {
  if (! today) {
    return "N.A.";
  }
  today = new Date(today.toString());
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!

  var yyyy = today.getFullYear();
  if(dd<10){
      dd='0'+dd;
  }
  if(mm<10){
      mm='0'+mm;
  }
  return dd+'/'+mm+'/'+yyyy;
}
