import { Component, OnInit } from "@angular/core";
import { MeteorComponent } from 'angular2-meteor';
import { Meteor } from "meteor/meteor";
import { Router } from '@angular/router';
import template from "./landing.component.html";

@Component({
    selector: "landing",
    template
})

export class LandingComponent implements OnInit {
    constructor(private router: Router) {
        if(Meteor.userId()){
            this.router.navigate(['/dashboard']);
        }
    }

    ngOnInit() {
    }
}
