import { Meteor } from "meteor/meteor";
import { Component, OnInit, OnDestroy, NgZone, AfterViewInit, AfterViewChecked } from "@angular/core";
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MeteorComponent } from 'angular2-meteor';
import { SessionStorageService } from 'ng2-webstorage';
import { InjectUser } from "angular2-meteor-accounts-ui";
import { upload } from '../../../../both/methods/pdfs.methods';
import { Title } from '@angular/platform-browser';
import { Roles } from 'meteor/alanning:roles';
import { showAlert } from "../shared/show-alert";

import template from "./step1.component.html";

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
export class UploadCertStep1Component extends MeteorComponent implements OnInit, AfterViewChecked, OnDestroy {
  isUploading: boolean;
  isUploaded: boolean;
  agentCertificate: Document;

  constructor(private router: Router,
      private route: ActivatedRoute,
      private ngZone: NgZone,
      private titleService: Title,
      private sessionStorage: SessionStorageService
  ) {
      super();
  }

  ngOnInit() {
    this.titleService.setTitle("Agent Certificate Upload | Atorvia");
  }

  ngAfterViewChecked() {
  }

  onFileSelect(event, field) {
    var files = event.srcElement.files;
    // console.log(files);
    this.startUpload(files[0], field);
  }

  private startUpload(file: File, field): void {
      // check for previous upload
      if (this.isUploading === true && field == 'agentCertificate') {
        showAlert("Previous file is already uploading.", "danger");
        return;
      }

      // start uploading
      if (field == 'agentCertificate') {
        this.isUploaded = false;
        this.isUploading = true;
      }
      upload(file)
      .then((res) => {
          if (field == 'agentCertificate') {
            this.isUploading = false;
            this.isUploaded = true;
          }
          let document: Document = {
            id: res._id,
            url: res.path,
            name: res.name
          };
          if (field == 'agentCertificate') {
            this.agentCertificate = document;
          }
          // console.log("document upload done.");
          // console.log("file id:", res._id);
      })
      .catch((error) => {
          this.isUploading = false;
          console.log('Error in file upload:', error);
          showAlert(error.reason, "danger");
      });
  }

  saveStep1() {
    if (! this.agentCertificate || ! this.agentCertificate.url) {
      showAlert("Please upload Agent Certificate document.", "danger");
      return;
    }

    this.call("users.update", {"profile.supplier.agentCertificate" : this.agentCertificate}, (err, res) => {
      if (! err) {
        this.ngZone.run(() => {
          this.router.navigate(['/signup/step2']);
        });
      } else {
        showAlert(err.reason, "danger");
      }
    })
  }
}
