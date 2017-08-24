import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router'
import template from './header.min.component.html';
import {InjectUser} from "angular2-meteor-accounts-ui";
import { Page } from "../../../../both/models/page.model";
import { MeteorComponent } from 'angular2-meteor';

@Component({
    selector: 'header-min',
    template
})
@InjectUser('user')
export class HeaderMinComponent extends MeteorComponent implements AfterViewInit {
    pages: Page[];
    constructor(private router: Router) {
      super();
    }

    ngAfterViewInit() {
      const options:any = {
          limit: 0,
          skip: 0,
          sort: { "title": 1 },
          fields: {title: 1, slug: 1}
      };
      let searchString = "";
      this.call("pages.find", options, {}, searchString, (err, res) => {
        if (err) {
          console.log("Error calling pages.find");
          return;
        }
        this.pages = res.data;
      });
    }
}
