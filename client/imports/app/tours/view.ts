import { Component, OnInit, AfterViewInit, AfterViewChecked, OnDestroy, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { Title } from '@angular/platform-browser';
import { MeteorComponent } from 'angular2-meteor';
import { Observable, Subscription, Subject, BehaviorSubject } from "rxjs";
import { ChangeDetectorRef } from "@angular/core";
import { InjectUser } from "angular2-meteor-accounts-ui";
import { SessionStorageService } from 'ng2-webstorage';
import { Tour } from "../../../../both/models/tour.model";
import { showAlert } from "../shared/show-alert";
import * as moment from 'moment';
import template from './view.html';

interface Pagination {
  limit: number;
  skip: number;
}

interface Options extends Pagination {
  [key: string]: any
}

interface DateRange {
  _id: string;
  startDate: Date;
  endDate: Date;
  price?: [{
    numOfPersons: number;
    adult: number;
    child: number;
  }],
  numOfSeats: number;
  soldSeats: number;
  availableSeats: number;
}

@Component({
  selector: '',
  template
})
@InjectUser('user')
export class TourViewComponent extends MeteorComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  paramsSub: Subscription;
  query: string;
  error: string;
  tour: Tour;
  selDateRange: DateRange = null;

  constructor(private zone: NgZone, private titleService: Title, private router: Router, private ngZone: NgZone, private route: ActivatedRoute, private changeDetectorRef: ChangeDetectorRef, private sessionStorage: SessionStorageService) {
    super();
  }

  ngOnInit() {
    this.paramsSub = this.route.params
      .map(params => params['id'])
      .subscribe(id => {
          this.query = id;

          this.call("tours.findOne", {_id: this.query}, (err, res) => {
            if (err) {
              console.log(err.reason, "danger");
              return;
            }

            let tour = res.name;
            let name = tour.toUpperCase();
            this.titleService.setTitle("Tour - " + name + " | Atorvia");
            this.tour = <Tour>res;
            this.changeDetectorRef.detectChanges();
          })
        });
  }

  ngAfterViewChecked() {
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
  }


  scrollToDiv(elemId) {
    jQuery('html, body').animate({
        scrollTop: jQuery("#" + elemId).offset().top
    }, 500);
  }

  detectChanges() {
    this.changeDetectorRef.detectChanges();
  }

  isAvailSchedule(row: DateRange) {
    let startDate = new Date(row.startDate.toString());
    let a = moment.utc(startDate);
    a.set({hour:0,minute:0,second:0,millisecond:0})
    let b = moment.utc(new Date());
    b.set({hour:0,minute:0,second:0,millisecond:0})
    let diff = a.diff(b, 'days');
    if (diff <= 0) {
      return false;
    }
    return true;
  }

  get tourDetails() {
    return this.tour;
  }

  canEdit(tour: Tour) {
    if (! tour.requestApprovalSentAt || tour.rejected == true) {
      return true;
    }
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
        totalSoldSeats: res.totalSoldSeats
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

  canDelete(tour: Tour) {
    if (tour.approved == false)
    {
      return true;
    }
  }

  deleteTour(tour: Tour) {
    if (!confirm("Are you sure, do you want to continue?")) {
      return false;
    }

    Meteor.call("tours.delete", tour._id, (err, res) => {
      if (err) {
          showAlert(err.reason, "danger");
          return;
      }
      showAlert("Tour has been deleted.", "success");
      this.ngZone.run(() => {
        this.router.navigate(['/tours/list']);
      })
    });
  }

}
