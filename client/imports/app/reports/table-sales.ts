import { Meteor } from "meteor/meteor";
import { MeteorComponent } from 'angular2-meteor';
import { Component, Input, OnInit, OnDestroy, NgZone, AfterViewInit, AfterViewChecked, OnChanges, SimpleChanges } from "@angular/core";
import { Observable, Subscription, Subject, BehaviorSubject } from "rxjs";
import { PaginationService } from "ng2-pagination";
import { ChangeDetectorRef } from "@angular/core";
import { Title } from '@angular/platform-browser';
import { Booking } from "../../../../both/models/booking.model";
import * as _ from 'underscore';
import { showAlert } from "../shared/show-alert";

import template from "./table-sales.html";

interface Pagination {
  limit: number;
  skip: number;
}

interface Options extends Pagination {
  [key: string]: any
}

@Component({
  selector: 'sales-table',
  template
})
export class SalesTableComponent extends MeteorComponent implements OnInit, OnChanges {
    items: Booking[];
    pageSize: Subject<number> = new Subject<number>();
    curPage: Subject<number> = new Subject<number>();
    orderBy: Subject<string> = new Subject<string>();
    nameOrder: Subject<number> = new Subject<number>();
    optionsSub: Subscription;
    itemsSize: number = -1;
    searchSubject: Subject<string> = new Subject<string>();
    searchString: string = "";
    @Input() where: any = {};
    whereCond: any = {};
    whereSub: Subject<any> = new Subject<any>();

  constructor(private paginationService: PaginationService,
    private ngZone: NgZone,
    private titleService: Title,
    private changeDetectorRef: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {
    this.titleService.setTitle("Sales Reports | Atorvia");
    this.setOptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['where']) {
      let whereCond = changes["where"].currentValue;
      if (! whereCond) {
        whereCond = {};
      }
      this.whereCond = {
        confirmed: true,
        bookingDate: whereCond.bookingDate
      };
      this.whereSub.next(this.whereCond);
    }
  }

  setWhereCond(where: any) {
    this.whereCond = {
      confirmed: true,
      bookingDate: where.bookingDate
    };
    this.whereSub.next(this.whereCond);
  }

  private setOptions() {
      let options = {
          limit: 10,
          curPage: 1,
          orderBy: "bookingDate",
          nameOrder: -1,
          searchString: this.searchString,
          where: this.whereCond
      }

      this.paginationService.register({
      id: "bookings",
      itemsPerPage: 10,
      currentPage: options.curPage,
      totalItems: this.itemsSize
      });

      this.pageSize.next(options.limit);
      this.curPage.next(options.curPage);
      this.orderBy.next(options.orderBy);
      this.nameOrder.next(options.nameOrder);
      this.searchSubject.next(options.searchString);
      this.whereSub.next(options.where);

      this.setOptionsSub();
  }

  private setOptionsSub() {
      this.optionsSub = Observable.combineLatest(
          this.pageSize,
          this.curPage,
          this.orderBy,
          this.nameOrder,
          this.whereSub,
          this.searchSubject
      ).subscribe(([pageSize, curPage, orderBy, nameOrder, where, searchString]) => {
          // console.log("inside subscribe");
          // console.log(where);
          const options: Options = {
              limit: pageSize as number,
              skip: ((curPage as number) - 1) * (pageSize as number),
              sort: { [orderBy]: nameOrder as number }
          };

          this.paginationService.setCurrentPage("bookings", curPage as number);

          this.searchString = searchString;
          jQuery(".loading").show();
          this.call("bookings.find", options, where, searchString, (err, res) => {
              jQuery(".loading").hide();
              if (err) {
                  showAlert("Error while fetching bookings list.", "danger");
                  return;
              }
              this.items = res.data;
              // console.log(res.data);
              this.itemsSize = res.count;
              this.paginationService.setTotalItems("bookings", this.itemsSize);
          })
      });
  }

  onPageChanged(page: number) {
    this.curPage.next(page);
  }

  get pageArr() {
      return this.items;
  }

}
