import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';

import { BookingsPageComponent } from './list';
import { BookingsViewComponent } from './view';
import { BookingsCancelComponent } from "./cancel";
export const routes = [
    {path: "bookings/list", component: BookingsPageComponent },
    {path: "bookings/view/:id", component: BookingsViewComponent },
    {path: "bookings/cancel/:id", component: BookingsCancelComponent },
];
