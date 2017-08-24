import { Meteor } from "meteor/meteor";
import { Component, OnInit, OnDestroy, NgZone, AfterViewInit, AfterViewChecked } from "@angular/core";
import { Observable, Subscription, Subject, BehaviorSubject } from "rxjs";
import { MeteorObservable } from "meteor-rxjs";
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MeteorComponent } from 'angular2-meteor';
import { ChangeDetectorRef } from "@angular/core";
import { Booking } from "../../../../both/models/booking.model";
import { showAlert } from "../shared/show-alert";
import { Roles } from 'meteor/alanning:roles';
import { Title } from '@angular/platform-browser';
import * as moment from 'moment';
import * as _ from 'underscore';

import template from "./cancel.html";

declare var jQuery:any;

@Component({
  selector: '',
  template
})
export class BookingsCancelComponent extends MeteorComponent implements OnInit, AfterViewChecked, OnDestroy {
    paramsSub: Subscription;
    item: Booking;
    cancellationForm: FormGroup;

    constructor(private router: Router,
        private route: ActivatedRoute,
        private titleService: Title,
        private ngZone: NgZone,
        private changeDetectorRef: ChangeDetectorRef,
        private formBuilder: FormBuilder
    ) {
        super();
    }

    ngOnInit() {
        this.titleService.setTitle("Cancel Booking Form | Atorvia");
        this.paramsSub = this.route.params
        .map(params => params['id'])
        .subscribe(id => {

            if (! id) {
            showAlert("Invalid booking-id supplied.");
            return;
            }

            this.call("bookings.findOne", {_id: id, confirmed: false, cancelled: false}, (err, res) => {
                if (err) {
                    showAlert(err.reason, "danger");
                    return;
                }

                if (_.isEmpty(res)) {
                  showAlert(`Invalid booking-id "${id}" supplied`);
                  this.router.navigate(['/bookings/list']);
                  return;
                }

                this.item = res;
                this.changeDetectorRef.detectChanges();
            })

        });

        this.cancellationForm = this.formBuilder.group({
          reason: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(100)]) ],
          comments: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(255)]) ]
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

      if (booking.cancelled == true) {
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

    cancelBooking() {
      if (! this.cancellationForm.valid) {
        showAlert("Please fill the form completly.", "danger");
        return;
      }
      let booking = this.item;
      booking.confirmed = false;
      booking.cancelled = true;

      let cancellationForm = this.cancellationForm.value;
      // console.log(cancellationForm);

      this.call("bookings.cancel", booking._id, cancellationForm, (err, res) => {
        if (err) {
          showAlert(err.reason, "danger");
          return;
        }

        this.changeDetectorRef.detectChanges();

        this.ngZone.run(() => {
          showAlert("Booking has been cancelled successfully.", "success");
          this.router.navigate(['/bookings/list']);
        });
      });
    }
}
