import { Meteor } from 'meteor/meteor';
import { Injectable, NgZone } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Observable } from "rxjs";
import { MeteorObservable } from "meteor-rxjs";
import { Router, ActivatedRoute, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Roles } from 'meteor/alanning:roles';
import { UserService } from './user';
import { showAlert } from "../app/shared/show-alert";
1
@Injectable()
export class AuthService implements CanActivate {
  constructor(private user: UserService, private router: Router, private zone: NgZone) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot
  ): Observable<boolean>|Promise<boolean>|boolean {

    if (typeof route.data["roles"] !== "undefined") {
      let roles = route.data["roles"] as Array<string>;
      return this.verifyRoles(roles);
    }

    if (typeof route.data["state"] !== "undefined") {
      let userState = route.data["state"] as string;
      return this.verifyState(userState);
    }
  }

  verifyRoles(roles: string[]): Observable<boolean>|Promise<boolean>|boolean {
    return MeteorObservable.subscribe("users").map(() => {

      if (! Roles.userIsInRole(Meteor.userId(), roles) ) {
        if (this.user.isLoggedIn()) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/login']);
        }
        return false;
      } else {
        return true;
      }
    });
  }

  verifyState(userState: string): boolean {
    if (userState == 'not-login' && this.user.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    if (userState == 'login' && ! this.user.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
