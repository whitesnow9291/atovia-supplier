import { Meteor } from "meteor/meteor";
import { MeteorComponent } from 'angular2-meteor';
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, NgZone, AfterViewInit, AfterViewChecked } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import { SessionStorageService } from 'ng2-webstorage';
import { ChangeDetectorRef } from "@angular/core";
import { Tour } from "../../../../both/models/tour.model";
import * as moment from 'moment';
import { showAlert } from "../shared/show-alert";

import template from "./table.html";

@Component({
  selector: 'tours-table',
  template
})
export class ToursTableComponent extends MeteorComponent {
    @Input() pageArr: Tour[];
    @Input() itemsSize: number = -1;
    @Input() showAction: boolean = false;
    @Output() onDelete = new EventEmitter<boolean>();

  constructor(
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private ngZone: NgZone,
    private sessionStorage: SessionStorageService,
  ) {
    super();
  }

  canEdit(tour: Tour) {
    if (! tour.requestApprovalSentAt || tour.approved == true) {
      return true;
    }
  }

  canDelete(tour: Tour) {
    if (tour.approved == false)
    {
      return true;
    }
  }

  deleteTour(tour: Tour, index) {
    if (!confirm("Are you sure, do you want to continue?")) {
      return false;
    }

    Meteor.call("tours.delete", tour._id, (err, res) => {
      if (err) {
          showAlert(err.reason, "danger");
          return;
      }

      let pageArr = this.pageArr;
      for (let i=0; i<pageArr.length; i++) {
        if (pageArr[i]._id == tour._id) {
          pageArr.splice(i, 1);
          this.onDelete.emit(true);
          this.changeDetectorRef.detectChanges();
        }
      }

      this.pageArr = pageArr;
      showAlert("Tour has been deleted.", "success");
    });
  }

  editTour(tour: Tour) {
    Meteor.call("tours.findOne", {_id: tour._id}, (err, res) => {
      if(err) {
        showAlert(err.reason, "danger");
        return;
      }

      this.sessionStorage.store("tourId", res._id);
      let detailstep1 = {
        name : res.name,
        description : res.description,
        departure : res.departure,
        destination : res.destination,
        noOfDays : res.noOfDays,
        noOfNights : res.noOfNights,
        tourType : res.tourType,
        tourPace : res.tourPace,
        hasGuide : res.hasGuide,
        hasFlight: res.hasFlight
      };
      this.sessionStorage.store("step1Details", detailstep1);
      let detailstep2 = {
        dateRange: res.dateRange,
        totalSeats: res.totalSeats,
        totalSoldSeats: res.totalSoldSeats,
        totalAvailableSeats: res.totalAvailableSeats
      }
      this.sessionStorage.store("step2Details", detailstep2);
      let detailstep3 = {
        itenerary: res.itenerary,
        totalMeals: res.totalMeals
      };
      this.sessionStorage.store("step3Details", detailstep3);
      let detailstep4 = {
        images: res.images,
        featuredImage: res.featuredImage
      };
      this.sessionStorage.store("step4Details", detailstep4);
      let detailstep5 = {
        inclusions : res.inclusions,
        exclusions : res.exclusions,
        cancellationPolicy: res.cancellationPolicy,
        refundPolicy: res.refundPolicy
      };
      this.sessionStorage.store("step5Details", detailstep5);
      this.ngZone.run(() => {
        this.router.navigate(['/tours/create/step1']);
      })
    });
  }
}
