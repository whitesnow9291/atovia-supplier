import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';
import { AuthService } from "../services/auth";

import { SignupComponent } from "./auth/singup.component";
import { RecoverComponent } from "./auth/recover.component";
import { LoginComponent } from "./auth/login.component.web";
import { ResendEmailComponent } from "./auth/resend-email.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { LandingComponent } from "./layout/landing.component";
import { ResetPassword } from "./auth/resetpassword";
import { VerifyEmail } from "./auth/verifyemail.component";
import { accountRoutes } from "./account/account.routes";
import { routes as pageRoutes } from "./content-page/routes";
import { routes as tourRoutes } from "./tours/routes";
import { routes as faqRoutes } from "./faqs/routes";
import { routes as bookingRoutes } from "./bookings/routes";
import { routes as reportsRoutes } from "./reports/routes";
import { routes as uploadRoutes } from "./upload-cert/routes";


let mainRoutes = [
    { path: '', component: LoginComponent, canActivate: [AuthService], data: {'state': 'not-login'} },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthService], data: {'state': 'login'} },
    { path: 'login', component: LoginComponent, canActivate: [AuthService], data: {'state': 'not-login'} },
    { path: 'signup', component: SignupComponent, canActivate: [AuthService], data: {'state': 'not-login'} },
    { path: 'recover', component: RecoverComponent, canActivate: [AuthService], data: {'state': 'not-login'} },
    { path: 'reset-password/:token',component: ResetPassword, canActivate: [AuthService], data: {'state': 'not-login'} },
    { path: 'verify-email/:token',component: VerifyEmail, canActivate: [AuthService], data: {'state': 'not-login'} },
    { path: 'resend-email', component: ResendEmailComponent, canActivate: [AuthService], data: {'state': 'not-login'} }
];

export const routes: Route[] = [
    ...mainRoutes,
    ...accountRoutes,
    ...pageRoutes,
    ...faqRoutes,
    ...tourRoutes,
    ...bookingRoutes,
    ...reportsRoutes,
    ...uploadRoutes
];

export const ROUTES_PROVIDERS = [
    {
        provide: 'canActivateForLoggedIn',
        useValue: () => !! Meteor.userId()
    },
    {
        provide: 'canActivateForLogoff',
        useValue: () => ! Meteor.userId()
    },
];
