import { Meteor } from "meteor/meteor";
import { Component, OnInit, OnDestroy, NgZone, AfterViewInit, AfterViewChecked } from "@angular/core";
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MeteorComponent } from 'angular2-meteor';
import { SessionStorageService } from 'ng2-webstorage';
import { InjectUser } from "angular2-meteor-accounts-ui";
import { ChangeDetectorRef } from "@angular/core";
import { showAlert } from "../shared/show-alert";
import { Title } from '@angular/platform-browser';
import { upload } from '../../../../both/methods/pdfs.methods';
import { Roles } from 'meteor/alanning:roles';

import template from "./step2.component.html";

declare var jQuery:any;

interface Document {
  id: string;
  url: string;
  name: string;
}

@Component({
  selector: '',
  template
})
@InjectUser("user")
export class UploadCertStep2Component extends MeteorComponent implements OnInit, AfterViewChecked, OnDestroy {
  isUploading: boolean;
  isUploaded: boolean;
  agentIdentity: Document;
  constructor(private router: Router,
      private route: ActivatedRoute,
      private ngZone: NgZone,
      private titleService: Title,
      private sessionStorage: SessionStorageService,
      private changeDetectorRef: ChangeDetectorRef
  ) {
      super();
  }

  ngOnInit() {
    this.titleService.setTitle("Agent Identity Upload | Atorvia");
  }

  ngAfterViewChecked() {
  }

  onFileSelect(event, field) {
    var files = event.srcElement.files;
    console.log(files);
    this.startUpload(files[0], field);
  }

  private startUpload(file: File, field): void {
      // check for previous upload
      if (this.isUploading === true && field == 'agentIdentity') {
        showAlert("Previous file is already uploading.", "danger");
        return;
      }

      // start uploading
      if (field == 'agentIdentity') {
        this.isUploaded = false;
        this.isUploading = true;
      }
      upload(file)
      .then((res) => {
          if (field == 'agentIdentity') {
            this.isUploading = false;
            this.isUploaded = true;
          }
          let document: Document = {
            id: res._id,
            url: res.path,
            name: res.name
          };
          if (field == 'agentIdentity') {
            this.agentIdentity = document;
            this.changeDetectorRef.detectChanges();
          }
          // console.log("document upload done.");
          console.log("file id:", res._id);
      })
      .catch((error) => {
          this.isUploading = false;
          console.log('Error in file upload:', error);
          showAlert(error.reason, "danger");
      });
  }

  saveStep2(ownerName) {
    if (! /^[a-zA-Z\.]{2,}[a-zA-Z ]{0,30}$/.test(ownerName) ) {
      showAlert("Please fill valid Manager/Owner Name.", "danger");
      return;
    }

    if (! this.agentIdentity || ! this.agentIdentity.url) {
      showAlert("Please upload Agent Identity document.", "danger");
      return;
    }

    this.call("users.update", {"profile.supplier.agentIdentity" : this.agentIdentity, "profile.supplier.ownerName": ownerName}, (err, res) => {
      if (! err) {
        this.call("users.sendUploadCertNotification", () => {});
        showAlert("Your documents have been uploaded successfully.", "success");
        this.ngZone.run(() => {
          this.router.navigate(['/signup/step3']);
        });
      } else {
        showAlert(err.reason, "danger");
      }
    })
  }
}
