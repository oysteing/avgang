function createEnturApi() {
    return {
        getStopPlacesByPosition: createGetStopPlacesByPosition(),
    }
}

function responseHandler(response: Response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

function createGetStopPlacesByPosition() {

    const url = 'https://api.entur.io/geocoder/v1/reverse';
    return function getStopPlacesByPosition(
        coordinates: Coordinates
    ) {
        return fetch(url).then(responseHandler);
    }

}

export default createEnturApi