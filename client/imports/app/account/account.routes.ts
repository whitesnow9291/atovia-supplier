import { Routes } from '@angular/router';

import { UserDetailsComponent }    from './account.component';
import { PasswordComponent }  from './changepassword.component';

// Route Configuration
export const accountRoutes: Routes = [
  { path: 'account', component: UserDetailsComponent, canActivate: ['canActivateForLoggedIn'] },
  { path: 'changepassword', component: PasswordComponent, canActivate: ['canActivateForLoggedIn'] }
];
