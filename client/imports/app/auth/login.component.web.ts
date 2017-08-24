import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { MeteorComponent } from 'angular2-meteor';
import { LocalStorageService, SessionStorageService } from 'ng2-webstorage';
import { User } from "../../../../both/models/user.model";
import { validateEmail, validatePhoneNum, validateFirstName } from "../../validators/common";
import { showAlert } from "../shared/show-alert";
import { Title } from '@angular/platform-browser';
import template from './login.component.web.html';
import * as _ from 'underscore';

@Component({
  selector: 'login',
  template
})
export class LoginComponent extends MeteorComponent implements OnInit {
    loginForm: FormGroup;
    error: string;
    rememberMe = false;
    userId: string;

    constructor(private router: Router, private titleService: Title, private zone: NgZone, private formBuilder: FormBuilder, private localStorage: LocalStorageService, private sessionStorage: SessionStorageService) {
      super();
    }

    ngOnInit() {
        this.titleService.setTitle("Login | Atorvia");
        this.loginForm = this.formBuilder.group({
          email: ['', Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(50), validateEmail])],
          password: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(30)])]
        });

        this.error = '';
    }

    login() {
        if (! this.loginForm.valid) {
          showAlert("Invalid FormData supplied.", "danger");
          return;
        }

        Meteor.loginWithPassword(this.loginForm.value.email, this.loginForm.value.password, (err) => {
          this.subscribe("users");
          this.zone.run(() => {
            if (err) {
              showAlert(err.reason, "danger");
              this.error = err;
            } else {
                this.localStorage.store("rememberMeNot", !this.rememberMe);
                this.sessionStorage.store("Meteor.userId", Meteor.userId());
                let user = <User>Meteor.user();
                if (_.isEmpty(user.profile.supplier.agentCertificate)) {
                    showAlert("Upload your agent certificate to continue.", "info");
                    this.router.navigate(['/signup/step1']);
                } else if (_.isEmpty(user.profile.supplier.agentIdentity)) {
                    showAlert("Upload your identity to continue.", "info");
                    this.router.navigate(['/signup/step2']);
                } else if (_.isEmpty(user.profile.supplier.bankDetails)) {
                  showAlert("Fill your bank details to continue.", "info");
                  this.router.navigate(['/signup/step3']);
                } else {
                    showAlert("You have been logged in successfully.", "success");
                    this.router.navigate(['/dashboard']);
                }
            }
          });
      });
    }

    fblogin(): void {
     Meteor.loginWithFacebook({requestPermissions: ['public_profile,email']}, (err) => {
       this.zone.run(() => {
         if (err) {
           console.log("Error while calling loginWithFacebook:", err);
         } else {
           showAlert("You have been logged in successfully.", "success");
           this.router.navigate(['/dashboard']);
         }
       });
     });
   }
}
