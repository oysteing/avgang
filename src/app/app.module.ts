import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {IntroComponent} from './intro/intro.component';
import {StopsComponent} from './stops/stops.component';
import {DeparturesComponent} from './departures/departures.component';
import {AppRoutingModule} from "./app-routing.module";

@NgModule({
    declarations: [
        AppComponent,
        IntroComponent,
        StopsComponent,
        DeparturesComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
