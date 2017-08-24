import { Component, OnInit, AfterViewInit, AfterViewChecked, NgZone, ViewChild } from '@angular/core';
import { Meteor } from "meteor/meteor";
import { Router, ActivatedRoute } from '@angular/router';
import { PaginationService } from "ng2-pagination";
import { MeteorComponent } from 'angular2-meteor';
import { InjectUser } from "angular2-meteor-accounts-ui";
import { Observable, Subscription, Subject, BehaviorSubject } from "rxjs";
import { ChangeDetectorRef } from "@angular/core";
import { Chart } from 'chart.js';
import * as _ from 'underscore';
import { showAlert } from "../shared/show-alert";

import template from "./income-statistics.html";

@Component({
  selector: "income-statistics",
  template
})
@InjectUser('user')
export class IncomeStatisticsComponent extends MeteorComponent implements OnInit, AfterViewInit {
  chart: any = undefined;
  monthsArr: string[] = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  filter: {month: number; year: number;} = null;

  constructor(private ngZone: NgZone,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit() {
    let date = new Date();
    let month = date.getMonth();
    let year = date.getFullYear();
    this.filter = {
      month,
      year
    };

    // console.log(this.chart);
    if (this.chart === undefined) {
      this.chart = null;
      this.showChart();
    }
  }

  ngAfterViewInit() {

    Meteor.setTimeout(() => {
      jQuery(function($){

      });
    }, 500);

  }

  showChart() {
    let filter = this.filter;
    let criteria: any = {};
    criteria = {month: (Number(filter.month)+1), year: Number(filter.year)};
    // console.log(criteria);

    let labels = [];
    let dataSet = [];
    this.call("bookings.statistics.new", criteria, (err, res) => {
      if (err) {
        console.log("Error loading monthly statistics.");
        return;
      }

      let firstDay = new Date(criteria.year, criteria.month, 1);
      let lastDay = new Date(criteria.year, criteria.month, 0);

      for (let i=1; i<=lastDay.getDate(); i++) {
        //let srchResponse = _.find(res, {_id: {year: criteria.year, month: criteria.month, day: i} });
        let srchResponse = _.filter(res, function(obj: any) {
          if (obj._id["year"] == criteria.year && obj._id["month"] == criteria.month && obj._id["day"] == i) {
            return true;
          }
        });
        let day = i;
        labels.push(`${day}`);
        if (srchResponse.length) {
          dataSet.push(srchResponse[0] ["totalPrice"]);
        } else {
          dataSet.push(0);
        }
      }

      if (this.chart === null) {
        this.drawChart(labels, dataSet);
      } else {
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = dataSet;
        // console.log(this.chart.data);
        this.chart.update();
      }
    })
  }

  drawChart(labels, dataSet) {
    let ctx = document.getElementById("reportChart");
    let myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          fill: false,
          label: 'Income',
          data: dataSet,
          backgroundColor: [
            'rgba(231, 245, 243, 1)',
            'rgba(231, 245, 243, 1)',
            'rgba(231, 245, 243, 1)',
            'rgba(231, 245, 243, 1)',
            'rgba(231, 245, 243, 1)',
            'rgba(231, 245, 243, 1)'
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
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero:true
            }
          }]
        }
      }
    });

    this.chart = myChart;
  }

}

function getDateFromWeekNumber(year, week) {
  var d = new Date(year, 0, 1);
  var dayNum = d.getDay();
  var diff = --week * 7;

  // If 1 Jan is Friday to Sunday, go to next week
  if (!dayNum || dayNum > 4) {
    diff += 7;
  }

  // Add required number of days
  d.setDate(d.getDate() - d.getDay() + ++diff);
  return d;
}
