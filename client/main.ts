import 'angular2-meteor-polyfills';

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './imports/app/app.module';

//import ionicSelector from 'ionic-selector';

function setClass(css) {
  if (!document.body.className) {
    document.body.className = "";
  }
  document.body.className += " " + css;
}

Meteor.startup(() => {
  setClass('web');
  enableProdMode();

  const platform = platformBrowserDynamic();
  platform.bootstrapModule(AppModule);
});
