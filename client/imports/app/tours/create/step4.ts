import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { MeteorComponent } from 'angular2-meteor';
import { Title } from '@angular/platform-browser';
import { ChangeDetectorRef } from "@angular/core";
import { SessionStorageService } from 'ng2-webstorage';
import { UploadFS } from 'meteor/jalik:ufs';
import { showAlert } from "../../shared/show-alert";
import { ImagesStore } from '../../../../../both/collections/images.collection';
import { upload } from '../../../../../both/methods/images.methods';
import template from "./step4.html";

interface Image {
  id: string;
  url: string;
  name: string;
}

@Component({
  selector: '',
  template
})
export class CreateTourStep4Component extends MeteorComponent implements OnInit {
    step4Form: FormGroup;
    error: string;
    images: Image[] = [];
    featuredImage: Image;
    files: File[];
    fileIsOver: boolean = false;
    isUploading: boolean;
    isUploaded: boolean;

    constructor(private router: Router,
        private route: ActivatedRoute,
        private ngZone: NgZone,
        private titleService: Title,
        private formBuilder: FormBuilder,
        private sessionStorage: SessionStorageService,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        super();
    }

    ngOnInit() {
      this.titleService.setTitle("Add Tour Gallery | Atorvia");
      let step4Details = this.sessionStorage.retrieve("step4Details");
      if (step4Details) {
        this.images = step4Details.images;
        this.featuredImage = step4Details.featuredImage;
      }
    }

    ngAfterViewChecked() {
    }

    ngOnDestroy() {
    }

    fileOver(fileIsOver: boolean): void {
      this.fileIsOver = fileIsOver;
    }

    onFileSelect(event) {
      this.files = event.srcElement.files;
      this.fileUploadMultiple();
    }

    fileUploadMultiple(i=0) {
      if (typeof this.files[i] == "undefined") {
        return;
      }
      this.startUpload(this.files[i], i);
    }

    onFileDrop(file: File): void {
      this.startUpload(file);
    }

    private startUpload(file: File, i: number = null): void {
        // check for previous upload
        if (this.isUploading === true) {
            showAlert("Previous file is already uploading.", "danger");
            return;
        }

        // start uploading
        this.isUploaded = false;
        this.isUploading = true;
        upload(file)
        .then((res) => {
            this.isUploading = false;
            this.isUploaded = true;
            this.images.push({
              id: res._id,
              url: res.path,
              name: res.name
            });
            console.log("file id:", res._id);
            if (typeof i == "number") {
              this.fileUploadMultiple(++i);
            }
        })
        .catch((error) => {
            this.isUploading = false;
            console.log('Error in file upload:', error);
            showAlert(error.reason, "danger");
        });
    }

    removeImage(id: string) {
      if (!confirm("Are you sure, do you want to continue?")) {
        return false;
      }

      Meteor.call("images.delete", id, (err, res) => {
        if (err) {
            showAlert(err.reason, "danger");
            return;
        }

        let images = this.images;
        for (let i=0; i<images.length; i++) {
          if (images[i].id == id) {
            images.splice(i, 1);
            this.changeDetectorRef.detectChanges();
          }
        }

        this.images = images;
        showAlert("Image has been deleted.", "success");
      });
    }

    get imagesArr() {
      return this.images;
    }

    setFeaturedImage(image) {
      this.featuredImage = image;
    }

    step4() {
      let details = {
        images: this.images,
        featuredImage: this.featuredImage
      };
      this.sessionStorage.store("step4Details", details);
      let step4Details = this.sessionStorage.retrieve("step4Details");
      if (step4Details) {
        this.ngZone.run(() => {
          this.router.navigate(['/tours/create/step5']);
        });
      } else {
        showAlert("Error while saving data. Please try after restarting your browser.", "danger");
      }
    }
}
