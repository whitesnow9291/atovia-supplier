import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';


import { FaqPageComponent } from "./view";

export const routes = [
    {path: "faqs", component: FaqPageComponent}
];
