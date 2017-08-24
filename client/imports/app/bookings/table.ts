import { Meteor } from "meteor/meteor";
import { MeteorComponent } from 'angular2-meteor';
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, NgZone, AfterViewInit, AfterViewChecked } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from "@angular/core";
import { Booking } from "../../../../both/models/booking.model";
import { showAlert } from "../shared/show-alert";
import template from "./table.html";

@Component({
  selector: 'bookings-table',
  template
})
export class BookingsTableComponent extends MeteorComponent {
    @Input() pageArr: Booking[];
    @Input() itemsSize: number = -1;
    @Input() showAction: boolean = false;
    @Output() onApprove = new EventEmitter<boolean>();
    @Output() onDisapprove = new EventEmitter<boolean>();

    constructor(private router: Router, private changeDetectorRef: ChangeDetectorRef, private ngZone: NgZone) {
      super();
    }

    approveBooking(item: Booking) {
      item.confirmed = true;

      this.call("bookings.approve", item._id, (err, res) => {
        if (err) {
          showAlert(err.reason, "danger");
          return;
        }

        this.onApprove.emit(true);
        this.changeDetectorRef.detectChanges();

        showAlert("Booking has been approved successfully.", "success");
      });
    }

    disapproveBooking(item: Booking) {
      this.ngZone.run(() => {
        this.router.navigate(['/bookings/cancel', item._id]);
      });
    }


}
