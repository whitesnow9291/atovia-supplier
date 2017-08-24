import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { MeteorComponent } from 'angular2-meteor';
import { Title } from '@angular/platform-browser';
import { showAlert } from "../../shared/show-alert";
import { SessionStorageService } from 'ng2-webstorage';
import { Tour } from "../../../../../both/models/tour.model";
import * as _ from 'underscore';
import template from "./step6.html";

interface DateRange {
  date: string;
  seats: number;
  price: {
    adult: number;
    child: number;
  },
  hasDeparture: any;
}

declare var jQuery:any;

@Component({
  selector: '',
  template
})
export class CreateTourStep6Component extends MeteorComponent implements OnInit {
    tourDetails: Tour;
    dateRange: DateRange[] = [];
    constructor(private router: Router,
        private route: ActivatedRoute,
        private ngZone: NgZone,
        private formBuilder: FormBuilder,
        private titleService: Title,
        private sessionStorage: SessionStorageService
    ) {
        super();
    }

    ngOnInit() {
      this.titleService.setTitle("Tour Review | Atorvia");
      let step1Details = this.sessionStorage.retrieve("step1Details");
      let step2Details = this.sessionStorage.retrieve("step2Details");
      let step3Details = this.sessionStorage.retrieve("step3Details");
      let step4Details = this.sessionStorage.retrieve("step4Details");
      let step5Details = this.sessionStorage.retrieve("step5Details");

      if (step2Details) {
        // set date fields to date type explicitily in case of any mismatch
        for (let i=0; i<step2Details.dateRange.length; i++) {
          step2Details.dateRange[i].startDate = new Date(step2Details.dateRange[i].startDate.toString());
          step2Details.dateRange[i].endDate = new Date(step2Details.dateRange[i].endDate.toString());
        }
        this.dateRange = step2Details.dateRange;
      }
      this.tourDetails = _.extend({}, step1Details, step2Details, step3Details, step4Details, step5Details);
    }

    saveTour() {
      let tourId = this.sessionStorage.retrieve("tourid");
      if ( tourId ) {
        this.call("tours.update", this.tourDetails, tourId , (err, res) => {
          if(! err) {
            this.ngZone.run(() => {
              this.sessionStorage.clear("tourid");
              this.sessionStorage.clear("step1Details");
              this.sessionStorage.clear("step2Details");
              this.sessionStorage.clear("step3Details");
              this.sessionStorage.clear("step4Details");
              this.sessionStorage.clear("step5Details");
              this.router.navigate(['/tours/list']);
              showAlert("Tour updated successfully.", "success");
            })
          } else {
            showAlert("Error while saving tour data.", "danger");
          }
        });
      }
      else {
        this.call("tours.insert", this.tourDetails, (err, res) => {
          if(! err) {
            this.ngZone.run(() => {
              this.sessionStorage.clear("step1Details");
              this.sessionStorage.clear("step2Details");
              this.sessionStorage.clear("step3Details");
              this.sessionStorage.clear("step4Details");
              this.sessionStorage.clear("step5Details");
              this.router.navigate(['/tours/list']);
              showAlert("Tour added successfully.", "success");
            })
          } else {
            console.log("error",err);
            showAlert("Error while saving tour data.", "danger");
          }
        });
      }
    }
}
