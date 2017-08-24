import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators as CValidators } from "ng2-validation";
import { Router } from '@angular/router';
import { MeteorComponent } from 'angular2-meteor';
import { Accounts } from 'meteor/accounts-base';
import { Title } from '@angular/platform-browser';
import { validateEmail, validatePassword } from "../../validators/common";
import { showAlert } from "../shared/show-alert";

import template from './resend-email.html';

@Component({
  selector: '',
  template
})
export class ResendEmailComponent extends MeteorComponent implements OnInit {
  resendForm: FormGroup;
  error: string;

  constructor(private router: Router, private zone: NgZone, private titleService: Title, private formBuilder: FormBuilder) {
    super();
  }

  ngOnInit() {
    this.titleService.setTitle("Resend Email | Atorvia");
    this.resendForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(50), validateEmail])]
    });

    this.error = null;
  }

  resend() {
    if (! this.resendForm.valid) {
      showAlert("Invalid FormData supplied.", "danger");
      return;
    }

    let email = this.resendForm.value.email;
    this.error = null;
    this.call("users.resendVerificationEmail", email, (err, res) => {
      this.zone.run(() => {
        if (err) {
            showAlert(err.reason, "danger");
            this.error = err;
        } else {
          showAlert("We have initiated resending verification email request. Please check your email for further instructions.", "success");
          this.router.navigate(['/login']);
        }
      });
    });
  }
}
