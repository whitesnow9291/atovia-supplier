import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from "./user";
import { AuthService } from "./auth";

export const Services_Providers = [
    UserService,
    AuthService
];