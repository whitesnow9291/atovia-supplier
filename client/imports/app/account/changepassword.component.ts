import {Component, OnInit, NgZone} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import {MeteorComponent} from 'angular2-meteor';
import { matchingPasswords, validatePassword } from '../../validators/common';
import {showAlert} from "../shared/show-alert";

import template from './changepassword.component.html';

@Component({
  selector: '',
  template
})
export class PasswordComponent extends MeteorComponent implements OnInit {
  passwordForm: FormGroup;
  error: string;

  constructor(private router: Router, private zone: NgZone, private formBuilder: FormBuilder) {
    super();
  }

  ngOnInit() {
    this.passwordForm = this.formBuilder.group({
      oldpassword: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(30)])],
      newPassword: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(30)])],
      confirmPassword: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(30)])],
    }, {validator: matchingPasswords('newPassword', 'confirmPassword')});

     this.error = '';
  }

  changePassword() {
    if (! this.passwordForm.valid) {
      showAlert("Invalid FormData supplied.", "danger");
      return;
    }

    Accounts.changePassword(this.passwordForm.value.oldpassword, this.passwordForm.value.newPassword, (err) => {
      this.zone.run(() => {
        if (err) {
          this.error = err;
          showAlert(err.reason, "danger");
        } else {
          showAlert("Password updated successfully.", "success");
          this.router.navigate(['/dashboard']);
        }
      });
    });
  }
}
