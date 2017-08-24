import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { Title } from '@angular/platform-browser';
import { MeteorComponent } from 'angular2-meteor';
import { showAlert } from "../../shared/show-alert";
import { SessionStorageService } from 'ng2-webstorage';
import { upload } from '../../../../../both/methods/documents.methods';
import template from "./step5.html";

interface Document {
  id: string;
  url: string;
  name: string;
}

@Component({
  selector: '',
  template
})
export class CreateTourStep5Component extends MeteorComponent implements OnInit {
    step5Form: FormGroup;
    error: string;
    isUploading: boolean;
    isUploaded: boolean;
    isUploading1: boolean;
    isUploaded1: boolean;
    cancellationPolicy: Document;
    refundPolicy: Document;

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
      this.titleService.setTitle("Tour Inclusions & Exclusions | Atorvia");
      let step5Details = this.sessionStorage.retrieve("step5Details");
      if (! step5Details) {
        step5Details = {
          inclusions: [],
          exclusions: []
        };
      } else {
        this.refundPolicy = <Document>step5Details.refundPolicy;
        this.cancellationPolicy = <Document>step5Details.cancellationPolicy;
      }

      let inclusions = step5Details.inclusions.join("\n");
      let exclusions = step5Details.exclusions.join("\n");
      this.step5Form = this.formBuilder.group({
        inclusions: [inclusions, Validators.compose([Validators.required])],
        exclusions: [exclusions, Validators.compose([Validators.required])]
      });

      this.error = '';
    }

    ngAfterViewChecked() {
    }

    ngOnDestroy() {
    }

    onFileSelect(event, field) {
      var files = event.srcElement.files;
      console.log(files);
      this.startUpload(files[0], field);
    }

    private startUpload(file: File, field): void {
        // check for previous upload
        if (this.isUploading === true && field == 'cancellationPolicy') {
          showAlert("Previous file is already uploading.", "danger");
          return;
        } else if (this.isUploading1 === true && field == 'refundPolicy') {
          showAlert("Previous file is already uploading.", "danger");
          return;
        }

        // start uploading
        if (field == 'cancellationPolicy') {
          this.isUploaded = false;
          this.isUploading = true;
        } else if (field == 'refundPolicy') {
          this.isUploaded1 = false;
          this.isUploading1 = true;
        }

        upload(file)
        .then((res) => {
            if (field == 'cancellationPolicy') {
              this.isUploading = false;
              this.isUploaded = true;
            } else if (field == 'refundPolicy') {
              this.isUploaded1 = true;
              this.isUploading1 = false;
            }
            let document: Document = {
              id: res._id,
              url: res.path,
              name: res.name
            };
            if (field == 'cancellationPolicy') {
              this.cancellationPolicy = document;
            } else if (field == 'refundPolicy') {
              this.refundPolicy = document;
            }
            console.log("document upload done.")
            console.log("file id:", res._id);
        })
        .catch((error) => {
            this.isUploading = false;
            this.isUploading1 = false;
            console.log('Error in file upload:', error);
            showAlert(error.reason, "danger");
        });
    }

    step5() {this.router.navigate(['/tours/create/step6']);
      if (! this.step5Form.valid) {
        showAlert("Fill Tour Inclusions and Exclusions first.", "danger");
        return;
      }

      if (! this.cancellationPolicy || ! this.cancellationPolicy.url) {
        showAlert("Please upload Cancellation Policy document.", "danger");
        return;
      }

      if (! this.refundPolicy || ! this.refundPolicy.url) {
        showAlert("Please upload Refund Policy document.", "danger");
        return;
      }

      let details = {
        inclusions : this.step5Form.value.inclusions.split('\n'),
        exclusions : this.step5Form.value.exclusions.split('\n'),
        cancellationPolicy: this.cancellationPolicy,
        refundPolicy: this.refundPolicy
      };

      this.sessionStorage.store("step5Details", details);
      let step5Details = this.sessionStorage.retrieve("step5Details");
      if (step5Details) {
        this.ngZone.run(() => {
          this.router.navigate(['/tours/create/step6']);
        });
      } else {
        showAlert("Error while saving data. Please try after restarting your browser.", "danger");
      }
    }
}
