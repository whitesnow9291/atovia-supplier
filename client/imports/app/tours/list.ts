import { Meteor } from "meteor/meteor";
import { Component, OnInit, OnDestroy, NgZone, AfterViewInit, AfterViewChecked } from "@angular/core";
import { Observable, Subscription, Subject, BehaviorSubject } from "rxjs";
import { PaginationService } from "ng2-pagination";
import { MeteorObservable } from "meteor-rxjs";
import { Title } from '@angular/platform-browser';
import { InjectUser } from "angular2-meteor-accounts-ui";
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MeteorComponent } from 'angular2-meteor';
import { SessionStorageService } from 'ng2-webstorage';
import { ChangeDetectorRef } from "@angular/core";
import { Tour } from "../../../../both/models/tour.model";
import { showAlert } from "../shared/show-alert";
import { Roles } from 'meteor/alanning:roles';

import template from "./list.html";

interface Pagination {
  limit: number;
  skip: number;
}

interface Options extends Pagination {
  [key: string]: any
}

declare var jQuery:any;

@Component({
  selector: '',
  template
})
export class ListPageComponent extends MeteorComponent implements OnInit, AfterViewChecked, OnDestroy {
    items: Tour[];
    pageSize: Subject<number> = new Subject<number>();
    curPage: Subject<number> = new Subject<number>();
    orderBy: Subject<string> = new Subject<string>();
    nameOrder: Subject<number> = new Subject<number>();
    optionsSub: Subscription;
    itemsSize: number = -1;
    searchSubject: Subject<string> = new Subject<string>();
    searchString: string = "";
    whereCond: Subject<any> = new Subject<any>();
    searchTimeout: any;
    pendingCount: number;
    approvedCount: number;

    constructor(private router: Router,
        private route: ActivatedRoute,
        private paginationService: PaginationService,
        private ngZone: NgZone,
        private titleService: Title,
        private changeDetectorRef: ChangeDetectorRef,
        private sessionStorage: SessionStorageService
    ) {
        super();
    }

    ngOnInit() {
        this.titleService.setTitle("Tours List | Atorvia");
        this.call("tours.count", (err, res) => {
          if (! err) {
            this.pendingCount = res.pendingCount;
            this.approvedCount = res.approvedCount;
          }
        })
        this.setOptions();
    }

    ngAfterViewChecked() {
    }

    private setOptions() {
        let options = {
            limit: 10,
            curPage: 1,
            orderBy: "createdAt",
            nameOrder: -1,
            searchString: '',
            where: {"active": true, "approved": true}
        }

        this.setOptionsSub();

        this.paginationService.register({
        id: "tours",
        itemsPerPage: 10,
        currentPage: options.curPage,
        totalItems: this.itemsSize
        });

        this.pageSize.next(options.limit);
        this.curPage.next(options.curPage);
        this.orderBy.next(options.orderBy);
        this.nameOrder.next(options.nameOrder);
        this.searchSubject.next(options.searchString);
        this.whereCond.next(options.where);
    }

    private setOptionsSub() {
        this.optionsSub = Observable.combineLatest(
            this.pageSize,
            this.curPage,
            this.orderBy,
            this.nameOrder,
            this.whereCond,
            this.searchSubject
        ).subscribe(([pageSize, curPage, orderBy, nameOrder, where, searchString]) => {
            //console.log("inside subscribe");
            const options: Options = {
                limit: pageSize as number,
                skip: ((curPage as number) - 1) * (pageSize as number),
                sort: { [orderBy]: nameOrder as number }
            };

            this.paginationService.setCurrentPage("tours", curPage as number);

            this.searchString = searchString;
            this.items = [];
            this.itemsSize = -1;
            jQuery(".loading").show();
            this.call("tours.find", options, where, searchString, (err, res) => {
                jQuery(".loading").hide();
                if (err) {
                    showAlert("Error while fetching tours list.", "danger");
                    return;
                }
                this.items = res.data;
                // console.log(res.data);
                this.itemsSize = res.count;
                if ( where.approved == true ) {
                  this.approvedCount = res.count;
                } else {
                  this.pendingCount = res.count;
                }
                this.paginationService.setTotalItems("tours", this.itemsSize);
            })
        });
    }

    get pageArr() {
        return this.items;
    }

    search(value: string): void {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.searchSubject.next(value);
      }, 500);
    }

    newTour() {
      var tourId = this.sessionStorage.retrieve("tourId");
      if (!! tourId) {
        this.sessionStorage.clear("tourId");
        this.sessionStorage.clear("step1Details");
        this.sessionStorage.clear("step2Details");
        this.sessionStorage.clear("step3Details");
        this.sessionStorage.clear("step4Details");
        this.sessionStorage.clear("step5Details");
      } else {
        return;
      }
    }

    clearsearch(value: string): void {
        clearTimeout(this.searchTimeout);
    }

    onPageChanged(page: number): void {
        this.curPage.next(page);
    }

    changeOrderBy(sortBy: string): void {
      switch(sortBy) {
        case 'tour_asc':
        this.orderBy.next("name");
        this.nameOrder.next(1);
        break;
        case 'tour_desc':
        this.orderBy.next("name");
        this.nameOrder.next(-1);
        break;
        case 'length_asc':
        this.orderBy.next("noOfDays");
        this.nameOrder.next(1);
        break;
        case 'length_desc':
        this.orderBy.next("noOfDays");
        this.nameOrder.next(-1);
        break;
        case 'availability_asc':
        this.orderBy.next("totalAvailableSeats");
        this.nameOrder.next(1);
        break;
        case 'availability_desc':
        this.orderBy.next("totalAvailableSeats");
        this.nameOrder.next(-1);
        break;
        case 'price_asc':
        this.orderBy.next("dateRange.price.adult");
        this.nameOrder.next(1);
        break;
        case 'price_desc':
        this.orderBy.next("dateRange.price.adult");
        this.nameOrder.next(-1);
        break;
        default:
        this.orderBy.next("createdAt");
        this.nameOrder.next(-1);
        break;
      }
    }

    changeSortOrder(nameOrder: string): void {
        this.nameOrder.next(parseInt(nameOrder));
    }

    changeStatus(approved: boolean): void {
      this.whereCond.next({active: true, approved: approved});
    }

    onDelete(result) {
      this.pendingCount--;
      this.changeDetectorRef.detectChanges();
    }

    ngOnDestroy() {
        this.optionsSub.unsubscribe();
    }

    ngAfterViewInit() {
      Meteor.setTimeout(() => {
        jQuery(function($){
          /*$('select').material_select();
          $('.tooltipped').tooltip({delay: 50});*/

          $(".tab_content").hide();
          $(".tab_content:first").show();


          $("ul.tabs li").click(function() {
          $(".tab_content").hide();
          var activeTab = $(this).attr("rel");
          $("#"+activeTab).show();

          $("ul.tabs li").removeClass("active");
          $(this).addClass("active");

          $(".tab_drawer_heading").removeClass("d_active");
          $(".tab_drawer_heading[rel^='"+activeTab+"']").addClass("d_active");
          });

          $(".tab_drawer_heading").click(function() {
          $(".tab_content").hide();
          var d_activeTab = $(this).attr("rel");
          $("#"+d_activeTab).show();

          $(".tab_drawer_heading").removeClass("d_active");
          $(this).addClass("d_active");

          $("ul.tabs li").removeClass("active");
          $("ul.tabs li[rel^='"+d_activeTab+"']").addClass("active");
          });
        });
      }, 500);
    }
}
