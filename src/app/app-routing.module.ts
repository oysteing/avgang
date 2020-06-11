import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {DeparturesComponent} from "./departures/departures.component";
import {IntroComponent} from "./intro/intro.component";
import {StopsComponent} from "./stops/stops.component";

const routes: Routes = [
        {
                path: '',
                pathMatch: 'full',
                redirectTo: '/intro'
        },
        {
                path: 'intro',
                component: IntroComponent
        },
        {
                path: 'stops',
                component: StopsComponent
        },
        {
                path: 'departures',
                component: DeparturesComponent
        }
];

@NgModule({
        imports: [RouterModule.forRoot(routes)],
        exports: [RouterModule]
})
export class AppRoutingModule {
}
