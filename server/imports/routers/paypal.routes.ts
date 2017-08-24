import { Meteor } from "meteor/meteor";
import { HTTP } from 'meteor/http'
import * as bodyParser from "body-parser";
import * as paypal from "paypal-rest-sdk";
import { Transactions } from "../../../both/collections/transactions.collection";
import { Bookings } from "../../../both/collections/bookings.collection";

// configue paypal sdk
let paypalMode = Meteor.settings.public["paypal"] ["mode"];
let clientId = Meteor.settings.public["paypal"] ["clientId"];
let clientSecret = Meteor.settings.public["paypal"] ["clientSecret"];
paypal.configure({
  'mode': paypalMode, //sandbox or live
  'client_id': clientId,
  'client_secret': clientSecret
});

declare var Picker: any;
let rootUrl = process.env.ROOT_URL;

// Define our middleware using the Picker.middleware() method.
Picker.middleware( bodyParser.json() );
Picker.middleware( bodyParser.urlencoded( { extended: false } ) );

Picker.route( '/api/1.0/paypal/payment/get/', function( params, request, response, next ) {
  let body = request.body;
  let args = params.query;

  paypal.payment.get(args.paymentId, function (error, payment) {
      if (error) {
          //console.log(error);
          response.end( JSON.stringify(error) );
      } else {
          console.log("Get Payment Response");
          response.end( JSON.stringify(payment) );
      }
  });
});
