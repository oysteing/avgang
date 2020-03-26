export class Stops {

    page = document.getElementById('stoppested');

    constructor() {
        if (this.page != null) {
            this.page.addEventListener('pagecreate', this.loadPage);
        }
    }

    private loadPage() {
        let contentRoot = document.getElementById('stoppesteder');

        navigator.geolocation.getCurrentPosition(
            (position: Position) => getClosestStops(position),
            positionError => {
                console.log("Error: " + positionError);
            }
        );

        /*
                async function findStops(position: Position) {
                    const response = await fetch(`https://api.entur.io/geocoder/v1/reverse2?layers=venue&point.lat=${position.coords.latitude}&point.lon=${position.coords.longitude}`);
                    return await response.json();
                }
        */
        function getClosestStops(position: Position) {
            console.log("Position: " + position);
            //let result = enturService.getStopPlacesByPosition(position.coords);
            //console.log("Stoppesteder: " + result);
            /*findStops(position)
                .then(handleFetchErrors)
                .then(data => console.log(JSON.stringify(data)))
                .catch(error => displayError('Nettverksfeil', error));*/
        }

        /*
                function handleFetchErrors(response) {
                    if (!response.ok) {
                        console.log("Da var vi her da " + response.error);
                        throw Error(response.error);
                    }
                    return response;
                }

                function displayError(userMessage: string, error: Error) {
                    console.error(userMessage + ": " + error);
                    // @ts-ignore
                    contentRoot.innerHTML = userMessage;
                }
        */
    }
}