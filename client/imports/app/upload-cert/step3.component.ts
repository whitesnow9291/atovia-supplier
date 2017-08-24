import { Meteor } from "meteor/meteor";
import { Component, OnInit, OnDestroy, NgZone, AfterViewInit, AfterViewChecked } from "@angular/core";
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MeteorComponent } from 'angular2-meteor';
import { SessionStorageService } from 'ng2-webstorage';
import { InjectUser } from "angular2-meteor-accounts-ui";
import { Title } from '@angular/platform-browser';
import { upload } from '../../../../both/methods/pdfs.methods';
import { Roles } from 'meteor/alanning:roles';
import { showAlert } from "../shared/show-alert";

import template from "./step3.component.html";


@Component({
  selector: '',
  template
})
@InjectUser("user")
export class BankDetailsComponent extends MeteorComponent implements OnInit, AfterViewChecked, OnDestroy {
  bankDetailsForm: FormGroup;
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
    this.titleService.setTitle("Bank Details Form | Atorvia");
    this.bankDetailsForm = this.formBuilder.group({
      accountName: ['', Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(50)])],
      accountNumber: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(20)])],
      bankName: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(50)])],
      bankAddress: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(255)])],
      swiftCode: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(11)])]
    });

    this.error = '';
  }

  ngAfterViewChecked() {
  }

  saveStep3() {
    if (! this.bankDetailsForm.valid) {
      showAlert("Invalid form supplied.", "danger");
      return;
    }

    let bankDetails = {
      accountName: this.bankDetailsForm.value.accountName,
      accountNumber: this.bankDetailsForm.value.accountNumber,
      bankName: this.bankDetailsForm.value.bankName,
      bankAddress: this.bankDetailsForm.value.bankAddress,
      swiftCode: this.bankDetailsForm.value.swiftCode
    }

    console.log(bankDetails);
    this.call("users.update", {"profile.supplier.bankDetails" : bankDetails}, (err, res) => {
      if (! err) {
        this.ngZone.run(() => {
          this.router.navigate(['/dashboard']);
        });
      } else {
        showAlert(err.reason, "danger");
      }
    })
  }
}
