import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription, Subject, BehaviorSubject } from "rxjs";
import { Router, ActivatedRoute } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import { MeteorComponent } from 'angular2-meteor';
import { showAlert } from "../shared/show-alert";

@Component({
  selector: '',
  template: ""
})
export class VerifyEmail extends MeteorComponent implements OnInit {
  paramsSub: Subscription;
  passwordForm: FormGroup;
  error: string;
  token: string;
  userId: any;

  constructor(private router: Router, private route: ActivatedRoute, private zone: NgZone, private formBuilder: FormBuilder) {
    super();
  }

  ngOnInit() {
    this.paramsSub = this.route.params
    .map(params => params['token'])
    .subscribe(token => {
      this.token = token;

      this.call("users.verifyEmailToken", this.token, (err, res) => {
        this.zone.run(() => {
          if (err) {
            console.log("Error while calling users.findByEmailToken()");
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
          showAlert("Your email is verified now. Please login to continue.", "success");
          this.router.navigate(['/login']);
        });
      });
    });

     this.error = '';
  }

}
