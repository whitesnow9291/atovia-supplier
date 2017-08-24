import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";
import { Component, OnInit, OnDestroy, NgZone, AfterViewInit, AfterViewChecked } from "@angular/core";
import { Observable, Subscription, Subject, BehaviorSubject } from "rxjs";
import { MeteorObservable } from "meteor-rxjs";
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MeteorComponent } from 'angular2-meteor';
import { ChangeDetectorRef } from "@angular/core";
import { Title } from '@angular/platform-browser';
import { Booking } from "../../../../both/models/booking.model";
import { showAlert } from "../shared/show-alert";
import { Roles } from 'meteor/alanning:roles';
import * as moment from 'moment';
import template from "./view.html";

declare var jQuery:any;

@Component({
  selector: '',
  template
})
export class BookingsViewComponent extends MeteorComponent implements OnInit, AfterViewChecked, OnDestroy {
    paramsSub: Subscription;
    item: Booking;
    isProcessing: boolean = false;

    constructor(private router: Router,
        private route: ActivatedRoute,
        private ngZone: NgZone,
        private titleService: Title,
        private changeDetectorRef: ChangeDetectorRef,
    ) {
        super();
    }

    ngOnInit() {
        this.paramsSub = this.route.params
        .map(params => params['id'])
        .subscribe(id => {

            if (! id) {
            showAlert("Invalid booking-id supplied.");
            return;
            }

            this.call("bookings.findOne", {_id: id}, (err, res) => {
                if (err) {
                    showAlert(err.reason, "danger");
                    return;
                }

                // check completed flag
                if (new Date(res.startDate.toString()) < new Date()) {
                  res.completed = true;
                }

                let booking = res.tour.name;
                let name = booking.toUpperCase();
                this.titleService.setTitle("Booking - " + name + " | Atorvia");
                this.item = res;
                this.changeDetectorRef.detectChanges();
            })

        });

    }

    ngAfterViewChecked() {

    }

    get booking() {
        return this.item;
    }

    get bookingStatus() {
      let retVal = null;
      let booking = this.item;

      if (! booking.paymentInfo || booking.paymentInfo.status != 'approved') {
        retVal = "Unpaid";
      } else if (booking.cancelled == true && booking.refunded !== true) {
        retVal = "Refund Requested";
      } else if (booking.cancelled == true && booking.refunded == true) {
        retVal = "Cancelled";
      } else if (booking.confirmed !== true) {
          retVal = "Pending";
      } else if (booking.confirmed === true && booking.completed !== true) {
          retVal = "Confirmed";
      } else if (booking.completed === true) {
          retVal = "Completed";
      }

      return retVal;
    }

    get departInDays() {
      let booking = this.item;
      let a = moment.utc(booking.startDate);
      a.set({hour:0,minute:0,second:0,millisecond:0})
      let b = moment.utc(new Date());
      b.set({hour:0,minute:0,second:0,millisecond:0})
      let diff = a.diff(b, 'days');
      if (diff < 0) {
        diff = 0;
      }
      return diff;
    }

    approveBooking() {
      let booking = this.item;
      booking.confirmed = true;

      this.call("bookings.approve", booking._id, (err, res) => {
        if (err) {
          showAlert(err.reason, "danger");
          return;
        }

        this.changeDetectorRef.detectChanges();

        showAlert("Booking has been approved successfully.", "success");
      });
    }

    disapproveBooking() {
      let booking = this.item;
      this.ngZone.run(() => {
        this.router.navigate(['/bookings/cancel', booking._id]);
      });
    }
}
