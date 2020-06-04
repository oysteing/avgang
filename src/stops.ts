import createEnturApi from './entur-api';
import {Feature} from "./entur-feature";

const clientName = 'ØysteinGisnås-Avgang';
const enturApi = createEnturApi(clientName);

export class Stops {

    page = document.getElementById('stoppested');

    constructor() {
        if (this.page != null) {
            this.page.addEventListener('pagecreate', this.loadPage);
        }
    }

    private loadPage() {
        let contentRoot = document.getElementById('stoppesteder')!;

        navigator.geolocation.getCurrentPosition(
            (position) => getClosestStops(position),
            positionError => {
                console.log("Position error: " + positionError.code + ", " + positionError.message);
                renderMessage('Fant ikke posisjon', positionError.message, true);
            }
        );

        function getClosestStops(position: Position) {
            enturApi.getStopPlacesByPosition(position.coords, {layers: ['venue']})
                .then(features => {
                    if (features.length == 0) {
                        renderMessage('Ingen stoppesteder i nærheten');
                    } else {
                        renderStops(features);
                    }
                })
                .catch(reason => {
                    renderMessage('Nettverksfeil');
                });
        }

        function renderStops(features: Feature[]) {
            contentRoot.innerHTML = features.map(value => value.properties.name).join('<br>');
        }

        function renderMessage(message: string, detailMessage?: string, fakeLocation?: boolean) {
            contentRoot.innerHTML = message;
            if (detailMessage) {
                contentRoot.innerHTML += '<br>' + detailMessage;
            }
            if (fakeLocation) {
                contentRoot.innerHTML += '<br><a href="#main">(velg Jernbanetorget)</a>';
                contentRoot.addEventListener("click", selectJernbanetorget, {once: true});
            }
        }

        function selectJernbanetorget() {
            console.log('Jernbanetorget');
        }
    }
}