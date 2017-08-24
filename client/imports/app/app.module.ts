import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AccountsModule } from 'angular2-meteor-accounts-ui';
import { Ng2PaginationModule } from 'ng2-pagination';
import { Ng2Webstorage } from 'ng2-webstorage';
import { Ng2CompleterModule } from "ng2-completer";
import { FileDropModule } from "angular2-file-drop";
import { HttpModule } from '@angular/http';
import { AppComponent } from "./app.component.web";
import { GoogleplaceDirective } from "../directives/googleplace.directive";
import { ACC_DECLARATIONS } from "./account/index";
import { routes, ROUTES_PROVIDERS } from './app.routes';
import { SHARED_DECLARATIONS } from './shared';
import { AUTH_DECLARATIONS } from "./auth/index";
import { LAYOUT_DECLARATIONS } from "./layout/index";
import { Page_Declarations } from "./content-page/index";
import { Faq_Declarations } from "./faqs/index";
import { DASHBOARD_DECLARATIONS } from "./dashboard/index";
import { Tour_Declarations } from "./tours/index";
import { Booking_Declarations } from './bookings/index';
import { REPORTS_DECLARATIONS } from './reports/index';
import { UploadCert_Declarations } from './upload-cert/index';
import { Services_Providers } from "../services/index";


// Create config options (see ILocalStorageServiceConfigOptions) for deets:
let localStorageServiceConfig = {
    prefix: '',
    storageType: 'localStorage'
};

let moduleDefinition;

moduleDefinition = {
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    AccountsModule,
    Ng2PaginationModule,
    Ng2Webstorage,
    Ng2Webstorage.forRoot({ prefix: '', separator: '' }),
    FileDropModule,
    HttpModule,
    Ng2CompleterModule
  ],
  declarations: [
    GoogleplaceDirective,
    AppComponent,
    ...ACC_DECLARATIONS,
    ...SHARED_DECLARATIONS,
    ...AUTH_DECLARATIONS,
    ...DASHBOARD_DECLARATIONS,
    ...LAYOUT_DECLARATIONS,
    ...Page_Declarations,
    ...Faq_Declarations,
    ...Tour_Declarations,
    ...Booking_Declarations,
    ...REPORTS_DECLARATIONS,
    ...UploadCert_Declarations
  ],
  providers: [
    ...ROUTES_PROVIDERS,
    ...Services_Providers
  ],
  bootstrap: [
    AppComponent
  ]
}

@NgModule(moduleDefinition)
export class AppModule {
  constructor() {

  }
}
