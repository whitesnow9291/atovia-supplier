import { Component, OnInit, AfterViewInit, AfterViewChecked, NgZone } from '@angular/core';
import { Meteor } from "meteor/meteor";
import { InjectUser } from "angular2-meteor-accounts-ui";
import { Router, ActivatedRoute } from '@angular/router';
import { MeteorComponent } from 'angular2-meteor';
import template from "./dashboard.html";
import { Booking } from "../../../../both/models/booking.model";
import { Title } from '@angular/platform-browser';
import { Observable, Subscription, Subject, BehaviorSubject } from "rxjs";
import { ChangeDetectorRef } from "@angular/core";
import { User } from "../../../../both/models/user.model";
import { Chart } from 'chart.js';
import * as _ from 'underscore';
import { showAlert } from "../shared/show-alert";

interface Pagination {
  limit: number;
  skip: number;
}

interface Options extends Pagination {
  [key: string]: any
}

@Component({
  selector: "dashboard",
  template
})
@InjectUser('user')
export class DashboardComponent extends MeteorComponent implements OnInit, AfterViewInit, AfterViewChecked {
  userId: string;
  items: Booking[];
  user: User;
  bookingsCount: number[] = [];
  bookingsValue: number[] = [];

  constructor(private router: Router,
      private titleService: Title,
      private route: ActivatedRoute,
      private ngZone: NgZone,
      private changeDetectorRef: ChangeDetectorRef,
  ) {
      super();
  }

  ngAfterViewInit() {
  }

  ngAfterViewChecked() {
  }

  ngOnInit() {
    this.titleService.setTitle("Summary | Atorvia");
    if (! Meteor.userId()) {
      this.router.navigate(['/login']);
    } else {
      this.userId = Meteor.userId();
    }

    const options: Options = {
        limit: 10,
        skip: 0,
        sort: { "createdAt": -1 }
    };
    let where = {active: true, confirmed: false, completed: false};

    jQuery(".loading").show();
    this.call("bookings.find", options, where, "", (err, res) => {
        jQuery(".loading").hide();
        if (err) {
            console.log("Error while fetching recent bookings.", "danger");
            return;
        }
        this.items = res.data;
        this.changeDetectorRef.detectChanges();
    });

    this.call("bookings.statistics", (err, res) => {
      if (err) {
          showAlert("Error while fetching statistics.", "danger");
          return;
      }

      this.bookingsCount = res.bookingsCount;
      this.bookingsValue = res.bookingsValue;
      this.changeDetectorRef.detectChanges();
      this.createChart();
    })
  }

  get pageArr() {
      return this.items;
  }

  createChart() {
    let bookingsCount = this.bookingsCount;
    let bookingsValue = this.bookingsValue;

    let ctx = document.getElementById("myChart");
    let myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
            datasets: [{
                label: 'Bookings',
                data: bookingsCount,
                backgroundColor: [
                    'rgba(22, 160, 133, 1)',
                    'rgba(22, 160, 133, 1)',
                    'rgba(22, 160, 133, 1)',
                    'rgba(22, 160, 133, 1)',
                    'rgba(22, 160, 133, 1)',
                    'rgba(22, 160, 133, 1)'
                ],
                borderColor: [
                  'rgba(22, 160, 133, 1)',
                  'rgba(22, 160, 133, 1)',
                  'rgba(22, 160, 133, 1)',
                  'rgba(22, 160, 133, 1)',
                  'rgba(22, 160, 133, 1)',
                  'rgba(22, 160, 133, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true,
                        stepSize: 1
                    }
                }]
            }
        }
    });

    let ctx2 = document.getElementById("myChart2");
    let myChart2 = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
            datasets: [{
                label: 'Revenue',
                data: bookingsValue,
                backgroundColor: [
                    'rgba(22, 160, 133, 1)',
                    'rgba(22, 160, 133, 1)',
                    'rgba(22, 160, 133, 1)',
                    'rgba(22, 160, 133, 1)',
                    'rgba(22, 160, 133, 1)',
                    'rgba(22, 160, 133, 1)'
                ],
                borderColor: [
                  'rgba(22, 160, 133, 1)',
                  'rgba(22, 160, 133, 1)',
                  'rgba(22, 160, 133, 1)',
                  'rgba(22, 160, 133, 1)',
                  'rgba(22, 160, 133, 1)',
                  'rgba(22, 160, 133, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });
  }
}
