import {Feature} from './entur-feature';
const querystring = require("querystring");

function createEnturApi(clientName) {
    return {
        getStopPlacesByPosition: createGetStopPlacesByPosition(clientName),
    };
}

function responseHandler(response: Response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response.json();
}

type GetStopPlacesByPositionParam = {
    radius?: number
    size?: number
    layers?: Array<string>
};

function createGetStopPlacesByPosition(clientName: string) {
    const headers = { 'ET-Client-Name': clientName };

    return function getStopPlacesByPosition(
        coordinates: Coordinates,
        params: GetStopPlacesByPositionParam = {},
    ): Promise<Feature[]> {
        const url = new URL('https://api.entur.io/geocoder/v1/reverse');
        const searchParams = {
            'point.lat': coordinates.latitude,
            'point.lon': coordinates.longitude,
            ...(params.radius && {'boundary.circle.radius': params.radius}),
            ...(params.size && {size: params.size}),
            ...(params.layers && {layers: params.layers && params.layers.join(',')})
        };

        return get(
            url,
            searchParams,
            headers
            ).then(responseHandler)
            .then((data) => data.features || []);
    };
}

function get(
    url: URL,
    params?,
    headers?,
) {
    const qs = querystring.stringify(params);
    return fetch(url + '?' + qs, {headers});
}

export default createEnturApi;
