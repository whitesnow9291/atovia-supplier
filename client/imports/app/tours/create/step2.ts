import { Component, OnInit, NgZone, NgModule } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { Title } from '@angular/platform-browser';
import { ChangeDetectorRef } from "@angular/core";
import { MeteorComponent } from 'angular2-meteor';
import { showAlert } from "../../shared/show-alert";
import { SessionStorageService } from 'ng2-webstorage';
import { CustomValidators as CValidators } from "ng2-validation";
import template from "./step2.html";

interface DateRange {
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

declare var jQuery:any;

@Component({
  selector: '',
  template
})

export class CreateTourStep2Component extends MeteorComponent implements OnInit {
  step1Details: any;
  step2Form: FormGroup;
  dateRange: DateRange[] = [];
  totalSeats: number = 0;
  totalSoldSeats: number = 0;
  totalAvailableSeats: number = 0;
  error: string;
    constructor(private router: Router,
        private route: ActivatedRoute,
        private ngZone: NgZone,
        private titleService: Title,
        private formBuilder: FormBuilder,
        private sessionStorage: SessionStorageService,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        super();
    }

    ngOnInit() {
      this.titleService.setTitle("Add Tour Schedule | Atorvia");
      let step2Details = this.sessionStorage.retrieve("step2Details");
      if (! step2Details) {
        step2Details = {};
      }
      else {
        this.dateRange = step2Details.dateRange;
        this.totalSeats = <number>step2Details.totalSeats;
        this.totalSoldSeats = <number>step2Details.totalSoldSeats;
        this.totalAvailableSeats = <number>step2Details.totalAvailableSeats;
      }
      this.step2Form = this.formBuilder.group({
        startDate: ['', Validators.compose([])],
        endDate: ['', Validators.compose([])],
        seats: ['', Validators.compose([Validators.required, CValidators.min(1)])],
        price: this.formBuilder.array([
        ])
      });

      for (let i=0; i<5; i++) {
        let adultValidators = [CValidators.min(1), CValidators.max(5000)];
        if (i==0) {
          adultValidators.push(Validators.required);
        }
        let childValidators = [CValidators.min(1), CValidators.max(5000)];

        let control = <FormArray>this.step2Form.controls['price'];
        let priceGroup = this.formBuilder.group({
          numOfPersons: [(i+1), Validators.compose([Validators.required, CValidators.min(1), CValidators.max(100)])],
          adult: ['', Validators.compose(adultValidators)],
          child: ['', Validators.compose(childValidators)]
        });
        control.push(priceGroup);
      }
      this.error = '';
    }

    ngAfterViewInit() {
      let step1Details = this.sessionStorage.retrieve("step1Details");
      let noOfDays = step1Details.noOfDays;
      let callback = (noOfDays) => {
        var today = new Date();
        today.setDate(today.getDate() + 1);
        jQuery(function($){
          $('#datetimepicker1')
            .datepicker({
                format: 'dd/mm/yyyy',
                autoclose: true,
                startDate: today
            })
            .on('changeDate', function(e) {
              // console.log($("#datetimepicker1").datepicker("getDate"));
              // end date
              // disable dates earlier than departure date
              $('#datetimepicker2').datepicker("remove");

              let startDate = $("#datetimepicker1").datepicker("getDate");
              let endDate = new Date($("#datetimepicker1").datepicker("getDate"));
              endDate.setDate(endDate.getDate() + (noOfDays - 1));

              $('#datetimepicker2')
                .datepicker({
                    format: 'dd/mm/yyyy',
                    autoclose: true,
                    startDate: startDate
                });

                $('#datetimepicker2').val(getFormattedDate(endDate)).datepicker('update');
            });

          $('#datetimepicker2')
            .datepicker({
                format: 'dd/mm/yyyy',
                autoclose: true,
                startDate: new Date()
            });
        });

        function getFormattedDate(today) {
          var dd = today.getDate();
          var mm = today.getMonth()+1; //January is 0!

          var yyyy = today.getFullYear();
          if(dd<10){
              dd='0'+dd;
          }
          if(mm<10){
              mm='0'+mm;
          }
          return dd+'/'+mm+'/'+yyyy;
        }
      }
      setTimeout(`var callback = ${callback}; callback(${noOfDays})`, 500);
    }

    ngAfterViewChecked() {
    }

    ngOnDestroy() {
    }

    removeDateRange( index ) {
      if (!confirm("Are you sure you want to continue?")) {
        return false;
      }

      let dateRange = this.dateRange;
      this.totalSeats -= dateRange[index]["availableSeats"];
      this.totalAvailableSeats -= dateRange[index]["availableSeats"];
      dateRange.splice(index, 1);
      this.changeDetectorRef.detectChanges();
      this.dateRange = dateRange;
    }

    step2() {
      if (! $("#datetimepicker1").val()) {
        showAlert('Invalid Start date.', "danger");
        return;
      }

      if (! $("#datetimepicker2").val()) {
        showAlert('Invalid End date.', "danger");
        return;
      }

      if (! this.step2Form.valid) {
        console.log(this.step2Form.value);
        showAlert("Invalid FormData supplied.", "danger");
        return;
      }

      var startDate = convertToUTC($("#datetimepicker1").datepicker("getDate"));
      var endDate = convertToUTC($("#datetimepicker2").datepicker("getDate"));
      let priceRange = this.step2Form.value.price;
      if (! priceRange[0] ["child"]) {
        priceRange[0] ["child"] = priceRange[0] ["adult"];
      }
      for (let i=1; i<5; i++) {
        if (! priceRange[i] ["adult"]) {
          priceRange[i] ["adult"] = priceRange[i-1] ["adult"];
        }
        if (! priceRange[i] ["child"]) {
          priceRange[i] ["child"] = priceRange[i-1] ["child"];
        }
      }

      let object = {
        _id: new Meteor.Collection.ObjectID()._str,
        startDate,
        endDate,
        numOfSeats: <number>this.step2Form.value.seats,
        soldSeats: 0,
        availableSeats: <number>this.step2Form.value.seats,
        price: priceRange
      };

      let dateRange = this.dateRange;
      this.totalSeats += object.numOfSeats;
      this.totalAvailableSeats += object.numOfSeats;
      this.dateRange.push(object);
      this.dateRange.sort(function(a,b){
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return <any>new Date(a.startDate.toString()) - <any>new Date(b.startDate.toString());
      });

      //this.step2Form.reset();
      $('#datetimepicker1').val('').datepicker('update');
      $('#datetimepicker2').val('').datepicker('update');

      this.step2Form.setValue({
        price: [
        {numOfPersons: 1, adult: '', child: ''},
        {numOfPersons: 2, adult: '', child: ''},
        {numOfPersons: 3, adult: '', child: ''},
        {numOfPersons: 4, adult: '', child: ''},
        {numOfPersons: 5, adult: '', child: ''}
      ],
      startDate: '',
      endDate: '',
      seats: ''
    });
    }

    next() {
      if (this.dateRange.length <= 0) {
        showAlert("Fill Tour Schedule first.", "danger");
        return;
      }

      let details = {
        dateRange: this.dateRange,
        totalSeats: this.totalSeats,
        totalSoldSeats: this.totalSoldSeats,
        totalAvailableSeats: this.totalAvailableSeats
      };

      this.sessionStorage.store("step2Details", details);
      let step2Details = this.sessionStorage.retrieve("step2Details");
      if (step2Details) {
        this.ngZone.run(() => {
          this.router.navigate(['/tours/create/step3']);
        });
      } else {
        showAlert("Error while saving data. Please try after restarting your browser.", "danger");
      }
    }
}

function convertToUTC(date: Date) {
  var d = new Date();
  let offset = d.getTimezoneOffset();
  let time = date.getTime() - (offset * 60 * 1000);
  return new Date(time);
}
