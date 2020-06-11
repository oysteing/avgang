import {Feature} from './entur-feature';
const querystring = require('querystring');

const DEFAULT_HEADERS = {
    Accept: 'application/json',
    'Content-Type': 'application/json'
};

export const clientName = 'ØysteinGisnås-Avgang';
function createEnturApi(clientName) {
    return {
        getStopPlacesByPosition: createGetStopPlacesByPosition(clientName),
        getStopPlace: createGetStopPlace(clientName)
    };
}

function get(
    url: URL,
    params?,
    headers?,
) {
    const qs = querystring.stringify(params);
    return fetch(url + '?' + qs, {method: 'get', headers});
}

function post(
    url: string,
    params,
    headers?,
) {
    return fetch(url,
        {
            method: 'post',
            headers,
            body: JSON.stringify(params)
        });
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

function createGetStopPlace(clientName: string) {
    const headers = { ...DEFAULT_HEADERS, 'ET-Client-Name': clientName };

    return function getStopPlace(
        stopPlaceId: string
    ): Promise<string> {
        const url = 'https://api.entur.io/journey-planner/v2/graphql';

        return post(url, getDeparturesFromStopPlacesQuery, headers)
            .then(responseHandler);
    }
}

const getDeparturesFromStopPlacesQuery = `
{query:
"{
  stopPlace(id: "NSR:StopPlace:548") {
    id
  }
}",
variables:null}
`

export default createEnturApi;