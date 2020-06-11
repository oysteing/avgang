import {Component, OnInit} from '@angular/core';
import {LocationService} from "../services/location.service";
import {Feature} from "../entur-api/entur-feature";
import {Router} from "@angular/router";
import createEnturApi, {clientName} from "../entur-api/entur-api";

const enturApi = createEnturApi(clientName);

@Component({
    selector: 'stops',
    templateUrl: './stops.component.html',
    styleUrls: ['./stops.component.scss']
})
export class StopsComponent implements OnInit {

    private features: Feature[] | undefined;
    positionError = '';

    constructor(private locationService: LocationService, private router: Router) {
    }

    ngOnInit(): void {
        this.getPosition();
    }

    getPosition() {
        this.positionError = '';
        this.locationService.getCurrentPosition()
            .then(position => enturApi.getStopPlacesByPosition(position.coords))
            .then(features => {
                this.features = features;
            })
            .catch(reason => {
                let positionError = <PositionError>reason;
                if (positionError.code !== undefined) {
                    switch (positionError.code) {
                        case positionError.PERMISSION_DENIED:
                            this.handlePositionError('Mangler tilgang til posisjon. Sjekk innstillingene.', positionError);
                            break;
                        case positionError.POSITION_UNAVAILABLE:
                            this.handlePositionError('Posisjon ikke tilgjengelig', positionError);
                            break;
                        case positionError.TIMEOUT:
                            this.handlePositionError('Tidsavbrudd ved henting av posisjon', positionError);
                            break;
                        default:
                            this.handlePositionError('Teknisk feil ved henting av posisjon', positionError);
                            break;
                    }
                } else {
                    this.handlePositionError('Teknisk feil ved henting av posisjon', positionError);
                }
            });
    }

    private handlePositionError(userMessage: string, error: any) {
        console.warn('Position error:', userMessage, '-', error);
        this.positionError = userMessage;
    }

    selectStop(stopId: string) {
        this.router.navigate(['/departures'], {queryParams: {stopId: stopId}, skipLocationChange: true});
    }
}
