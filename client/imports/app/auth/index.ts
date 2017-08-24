import {LoginComponent} from "./login.component.web";
import {SignupComponent} from "./singup.component";
import {RecoverComponent} from "./recover.component";
import {ResetPassword} from './resetpassword';
import {VerifyEmail} from "./verifyemail.component";
import { ResendEmailComponent } from "./resend-email.component";

export const AUTH_DECLARATIONS = [
  LoginComponent,
  SignupComponent,
  RecoverComponent,
  ResetPassword,
  VerifyEmail,
  ResendEmailComponent
];
