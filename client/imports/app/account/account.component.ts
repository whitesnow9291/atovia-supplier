import { Component, OnInit, NgZone, AfterViewInit, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { MeteorComponent } from 'angular2-meteor';
import { showAlert } from "../shared/show-alert";
import { SessionStorageService } from 'ng2-webstorage';
import { Observable, Subscription, Subject } from "rxjs";
import { User } from "../../../../both/models/user.model";
import { Place } from "../../../../both/models/place.model";
import { Title } from '@angular/platform-browser';
import { InjectUser } from "angular2-meteor-accounts-ui";
import { CustomValidators as CValidators } from "ng2-validation";
import { validatePhoneNum, validateFirstName } from "../../validators/common";
import { upload } from '../../../../both/methods/images.methods';
import * as _ from 'underscore';
import template from './account.component.html';

declare var jQuery:any;

@Component({
  selector: '',
  template
})
@InjectUser("user")
export class UserDetailsComponent extends MeteorComponent implements OnInit, AfterViewInit, AfterViewChecked {
  profileForm: FormGroup;
  userId: string;
  oldEmailAddress: string;
  user: User;
  error: any
  isUploading: boolean = false;
  isUploaded: boolean = false;
  countries: Place[] = [];

  constructor(private router: Router,
    private route: ActivatedRoute,
    private ngZone: NgZone,
    private titleService: Title,
    private formBuilder: FormBuilder
  ) {
    super();
  }

  ngOnInit() {
    this.titleService.setTitle("Profile | Atorvia");
    if (! Meteor.userId()) { return; }
    this.profileForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(50), CValidators.email])],
      companyName: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
      contact: ['', Validators.compose([Validators.required, Validators.minLength(7), Validators.maxLength(15), validatePhoneNum])],
      address1: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
      address2: ['', Validators.compose([Validators.minLength(2), Validators.maxLength(50)])],
      suburb: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30)])],
      state: ['', Validators.compose([Validators.required])],
      postCode: ['', Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(12)])],
      country: ['', Validators.compose([Validators.required])],
      accountName: ['', Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(50)])],
      accountNumber: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(20)])],
      bankName: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(50)])],
      bankAddress: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(255)])],
      swiftCode: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(11)])]
    })
    let callback = (user) => {
      this.profileForm.controls['companyName'].setValue(user.profile.supplier.companyName);
      this.profileForm.controls['email'].setValue(user.emails[0].address);
      this.profileForm.controls['contact'].setValue(user.profile.contact);
      if (typeof user.profile.address == "undefined") {
        user.profile.address = {};
      }
      if (typeof user.profile.supplier.bankDetails == "undefined") {
        user.profile.supplier.bankDetails = {};
      }
      let bankDetails = user.profile.supplier.bankDetails;
      this.profileForm.controls['state'].setValue(user.profile.address.state);
      this.profileForm.controls['suburb'].setValue(user.profile.address.suburb);
      this.profileForm.controls['country'].setValue(user.profile.address.country);
      this.profileForm.controls['address2'].setValue(user.profile.address.address2);
      this.profileForm.controls['address1'].setValue(user.profile.address.address1);
      this.profileForm.controls['postCode'].setValue(user.profile.address.postCode);
      this.profileForm.controls['accountName'].setValue(bankDetails.accountName);
      this.profileForm.controls['accountNumber'].setValue(bankDetails.accountNumber);
      this.profileForm.controls['bankName'].setValue(bankDetails.bankName);
      this.profileForm.controls['bankAddress'].setValue(bankDetails.bankAddress);
      this.profileForm.controls['swiftCode'].setValue(bankDetails.swiftCode);
      this.oldEmailAddress = user.emails[0].address;
    };
    this.fetchUser(callback);

    this.call("places.findCountries", (err, res) => {
      if (err) {
        console.log(err.reason);
        return;
      }
      this.countries = res;
    });
  }

  ngAfterViewInit() {
    Meteor.setTimeout(() => {
      jQuery(function($){
      })
    }, 500);
  }

  ngAfterViewChecked() {
  }

  private fetchUser(callback) {
    //console.log("call users.findOne()")
    this.call("users.findOne", (err, res) => {
      if (err) {
        return;
      }
      //console.log("users.findOne():", res);
      callback(res);
    });
  }

  //update supplier's profile
  update() {
    if (! this.profileForm.valid) {
      showAlert("Invalid FormData supplied.", "danger");
      return;
    }

    let userData = {
      "profile.supplier.companyName": this.profileForm.value.companyName,
      "profile.contact": this.profileForm.value.contact,
      "profile.address": {
        address1: this.profileForm.value.address1,
        address2: this.profileForm.value.address2,
        suburb: this.profileForm.value.suburb,
        state:  this.profileForm.value.state,
        postCode: this.profileForm.value.postCode,
        country:  this.profileForm.value.country
      },
      "profile.supplier.bankDetails": {
        accountName: this.profileForm.value.accountName,
        accountNumber: this.profileForm.value.accountNumber,
        bankName: this.profileForm.value.bankName,
        bankAddress: this.profileForm.value.bankAddress,
        swiftCode: this.profileForm.value.swiftCode
      }
    };
    let emailAddress = {
      oldAddress: this.oldEmailAddress,
      newAddress: this.profileForm.value.email
    };

    this.error = null;
    this.call("users.update", userData, emailAddress, (err, res) => {
      this.ngZone.run(() => {
        if(err) {
          this.error = err;
        } else {
          this.oldEmailAddress = emailAddress.newAddress;
          showAlert("Your profile has been saved.", "success");
          this.router.navigate(['/account']);
        }
      });
    });
  }

  resetStateValue(country) {
    if (country == "Australia") {
      this.profileForm.controls['state'].setValue(null);
    }
  }

  onFileSelect(event) {
      var files = event.srcElement.files;
      this.startUpload(files[0]);
  }


  private startUpload(file: File): void {
      // check for previous upload
      if (this.isUploading === true) {
          console.log("aleady uploading...");
          return;
      }

      // start uploading
      this.isUploaded = false;
      //console.log('file uploading...');
      this.isUploading = true;

      upload(file)
      .then((res) => {
          this.isUploading = false;
          this.isUploaded = true;
          let userImage = {
            id: res._id,
            url: res.path,
            name: res.name
          };
          let userData = {
              "profile.image": userImage
          };
          this.call("users.update", userData, (err, res) => {
              if (err) {
                  console.log("Error while updating user picture");
                  return;
              }
              $("#inputFile").val("");
              this.user.profile.image = userImage;
              showAlert("Profile picture updated successfully.", "success");
          });
      })
      .catch((error) => {
          this.isUploading = false;
          console.log('Error in file upload:', error);
          showAlert(error.reason, "danger");
      });
  }

}
