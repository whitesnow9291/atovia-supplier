import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { MeteorComponent } from 'angular2-meteor';
import { showAlert } from "../../shared/show-alert";
import { SessionStorageService } from 'ng2-webstorage';
import template from "./step3.html";

@Component({
  selector: '',
  template
})
export class CreateTourStep3Component extends MeteorComponent implements OnInit {
    step3Form: FormGroup;
    step3Details: any;
    noOfDays: number;
    icons: {css: string; url: string} [] = [
      {
        css: 'green-icon',
        url: '/images/i1.png'
      },
      {
        css: 'orange-icon',
        url: '/images/i2.png'
      },
      {
        css: 'blue-icon',
        url: '/images/i3.png'
      },
      {
        css: 'yellow-icon',
        url: '/images/i4.png'
      },
      {
        css:'darkGren-icon',
        url: '/images/i5.png'
      },
      {
        css: 'purple-icon',
        url: '/images/i6.png'
      },
      {
        css:'grey-icon',
        url: '/images/i7.png'
      },
      {
        css:'lightBlue-icon',
        url: '/images/i8.png'
      }
    ]
    error: string;

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
      this.titleService.setTitle("Add Tour Itenerary | Atorvia");
      this.step3Form = this.formBuilder.group({
        itenerary: this.formBuilder.array([
        ])
      });
      this.step3Details = this.sessionStorage.retrieve("step3Details");
      if (! this.step3Details) {
        this.step3Details = {"itenerary": []};
      }
      this.error = '';
      this.loadItenerary();
    }

    private loadItenerary() {
      let step1Details = this.sessionStorage.retrieve("step1Details");
      let noOfDays = <number>step1Details.noOfDays;
      for(let i=0; i<noOfDays; i++) {
        this.addItenerary(i);
      }

      this.noOfDays = noOfDays;
    }

    private initItenerary(i) {
      let step3Details = this.step3Details.itenerary;
      if (typeof step3Details[i] == "undefined") {
        step3Details[i] = {};
      }

      return this.formBuilder.group({
        icon: [''],
        title: [step3Details[i].title, Validators.compose([Validators.required])],
        description: [step3Details[i].description, Validators.compose([Validators.required])],
        hotelType: [step3Details[i].hotelType, Validators.compose([])],
        hotelName: [step3Details[i].hotelName, Validators.compose([])],
        hasBreakfast: [step3Details[i].hasBreakfast],
        hasLunch: [step3Details[i].hasLunch],
        hasDinner: [step3Details[i].hasDinner]
      });
    }

    private addItenerary(i) {
      const control = <FormArray>this.step3Form.controls['itenerary'];
      control.push(this.initItenerary(i));
    }

    setIconClass(index, css) {
      this.step3Form.controls.itenerary.controls[index].controls.icon.setValue(css);
    }

    ngAfterViewChecked() {
    }

    ngOnDestroy() {
    }

    step3() {
      if (! this.step3Form.valid) {
        showAlert("Fill Tour Itenerary first.", "danger");
        return;
      }

      let itenerary = this.step3Form.value.itenerary;
      let totalMeals: number = 0;
      for (let i=0; i<itenerary.length; i++) {
        if (itenerary[i].hasBreakfast == true) {
          totalMeals++;
        }
        if (itenerary[i].hasLunch == true) {
          totalMeals++;
        }
        if (itenerary[i].hasDinner == true) {
          totalMeals++;
        }
      }
      let details = {
        itenerary,
        totalMeals
      };
      this.sessionStorage.store("step3Details", details);
      let step3Details = this.sessionStorage.retrieve("step3Details");
      if (step3Details) {
        this.ngZone.run(() => {
          this.router.navigate(['/tours/create/step4']);
        });
      } else {
        showAlert("Error while saving data. Please try after restarting your browser.", "danger");
      }
    }
}
