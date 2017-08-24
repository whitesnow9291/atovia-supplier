import {Component, OnInit, NgZone} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {Observable, Subscription, Subject, BehaviorSubject} from "rxjs";
import { Router, ActivatedRoute } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import { Title } from '@angular/platform-browser';
import {MeteorComponent} from 'angular2-meteor';
import { matchingPasswords, validatePassword } from '../../validators/common';
import {showAlert} from "../shared/show-alert";

import template from './resetpassword.html';

@Component({
  selector: '',
  template
})
export class ResetPassword extends MeteorComponent implements OnInit {
  paramsSub: Subscription;
  passwordForm: FormGroup;
  error: string;
  token: string;
  userId: any;

  constructor(private router: Router, private titleService: Title, private route: ActivatedRoute, private zone: NgZone, private formBuilder: FormBuilder) {
    super();
  }

  ngOnInit() {
    this.titleService.setTitle("Reset Password | Atorvia");
    this.paramsSub = this.route.params
      .map(params => params['token'])
      .subscribe(token => {
          this.token = token;

          this.call("users.findByPasswdToken", this.token, (err, res) => {
            this.zone.run(() => {
              if (err) {
                console.log("Error while calling users.findByToken()");
                showAlert("Uncaught server error. Please try again later.");
                this.router.navigate(['/signup']);
                return;
              }

              if (!res || !res.length) {
                console.log("Invalid token supplied");
                showAlert("Invalid token supplied.");
                this.router.navigate(['/signup']);
                return;
              }

              this.userId = res;
            });
          });
        });

    this.passwordForm = this.formBuilder.group({
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

    this.call("users.resetPasswd", this.token, this.passwordForm.value.newPassword, (err) => {
      this.zone.run(() => {
        if (err) {
          this.error = err;
          showAlert(err.reason, "danger");
        } else {
          showAlert("Your password is updated successfully. Please login to continue.", "success");
          this.router.navigate(['/login']);
        }
      });
    });

  }
}
