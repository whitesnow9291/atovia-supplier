import { Component, OnInit, AfterViewInit, AfterViewChecked, NgZone, ViewChild } from '@angular/core';
import { Meteor } from "meteor/meteor";
import { Router, ActivatedRoute } from '@angular/router';
import { PaginationService } from "ng2-pagination";
import { MeteorComponent } from 'angular2-meteor';
import { InjectUser } from "angular2-meteor-accounts-ui";
import { Observable, Subscription, Subject, BehaviorSubject } from "rxjs";
import { ChangeDetectorRef } from "@angular/core";
import { Chart } from 'chart.js';
import { SalesTableComponent } from "./table-sales";
import { PayoutsTableComponent } from "./table-payouts";
import { IncomeStatisticsComponent } from "./income-statistics.component";
import * as _ from 'underscore';
import { showAlert } from "../shared/show-alert";
import template from "./reports.html";

interface Pagination {
  limit: number;
  skip: number;
}

interface Options extends Pagination {
  [key: string]: any
}

declare var jQuery:any;

@Component({
  selector: "",
  template
})
@InjectUser('user')
export class ReportsComponent extends MeteorComponent implements OnInit, AfterViewInit, AfterViewChecked {
  activeTab: string = "Sales";
  whereCond: any = {};
  @ViewChild (SalesTableComponent) salesTable:SalesTableComponent;
  @ViewChild (PayoutsTableComponent) payoutsTable:PayoutsTableComponent;
  @ViewChild (IncomeStatisticsComponent) incomeStats:IncomeStatisticsComponent;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private paginationService: PaginationService,
    private ngZone: NgZone,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit() {
  }

  ngAfterViewChecked() {
  }

  filterSales(startDate, endDate) {
    let where = this.whereCond;

    if (startDate && endDate) {
      startDate = convertToUTC(new Date(startDate.replace(/^(\d\d)\/(\d\d)\/(\d{4})$/, "$3/$2/$1")));
      endDate = new Date(endDate.replace(/^(\d\d)\/(\d\d)\/(\d{4})$/, "$3/$2/$1"));
      endDate.setHours(23);
      endDate.setMinutes(59);
      endDate.setSeconds(59);
      endDate = convertToUTC(endDate);
      where["bookingDate"] = {$gte: startDate, $lte: endDate};
    } else {
      delete where["bookingDate"];
    }

    if (this.activeTab == "Sales") {
      this.salesTable.setWhereCond(where);
    } else {
      this.payoutsTable.setWhereCond(where);
    }
  }

  get paginationId() {
    if (this.activeTab == "Sales") {
      return "bookings";
    } else {
      return "payouts";
    }
  }

  onPageChanged(page: number) {
    if (this.activeTab == "Sales") {
      this.salesTable.onPageChanged(page);
    } else {
      this.payoutsTable.onPageChanged(page);
    }
  }


  ngAfterViewInit() {
    Meteor.setTimeout(() => {
      jQuery(function($){
        $('#datetimepicker3')
          .datepicker({
              format: 'dd/mm/yyyy',
              autoclose: true
          })
          .on('changeDate', function(e) {
            $('#datetimepicker4').datepicker("remove");

            let startDate = $("#datetimepicker3").datepicker("getDate");
            $('#datetimepicker4')
              .datepicker({
                  format: 'dd/mm/yyyy',
                  autoclose: true,
                  startDate: startDate
              });
          });

        $('#datetimepicker4')
          .datepicker({
              format: 'dd/mm/yyyy',
              autoclose: true
          })
          .on('changeDate', function(e) {

          });
      });
    }, 500);
  }
}

function convertToUTC(date: Date) {
  var d = new Date();
  let offset = d.getTimezoneOffset();
  let time = date.getTime() - (offset * 60 * 1000);
  return new Date(time);
}
