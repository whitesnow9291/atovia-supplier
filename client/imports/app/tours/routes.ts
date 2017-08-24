import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';
import { AuthService } from "../../services/auth";

import { ListPageComponent } from './list';
import { CreateTourStep1Component } from './create/step1';
import { CreateTourStep2Component } from './create/step2';
import { CreateTourStep3Component } from './create/step3';
import { CreateTourStep4Component } from './create/step4';
import { CreateTourStep5Component } from './create/step5';
import { CreateTourStep6Component } from './create/step6';
import { TourViewComponent } from './view';

export const routes = [
    {path: "tours/list", component: ListPageComponent },
    {path: "tours/create/step1", component: CreateTourStep1Component },
    {path: "tours/create/step2", component: CreateTourStep2Component },
    {path: "tours/create/step3", component: CreateTourStep3Component },
    {path: "tours/create/step4", component: CreateTourStep4Component },
    {path: "tours/create/step5", component: CreateTourStep5Component },
    {path: "tours/create/step6", component: CreateTourStep6Component },
    {path: "tours/view/:id", component: TourViewComponent}
];
