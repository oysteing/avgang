import {EstimatedCall, Feature, StopPlaceDepartures} from './entur-feature';
import {rejects} from "assert";
const querystring = require('querystring');

const DEFAULT_HEADERS = {
    Accept: 'application/json',
    'Content-Type': 'application/json'
};

export const clientName = 'ØysteinGisnås-Avgang';
function createEnturApi(clientName) {
    return {
        getStopPlacesByPosition: createGetStopPlacesByPosition(clientName),
        getStopPlace: createGetDepartures(clientName)
    };
}

function get(
    url: URL,
    params?,
    headers?,
) {
    const qs = querystring.stringify(params);
    return fetch(url + '?' + qs, {method: 'get', headers})
        .then(responseHandler);
}

function post<T>(
    url: string,
    params,
    headers?,
) {
    return fetch(url,
        {
            method: 'post',
            headers,
            body: JSON.stringify(params)
        })
        .then(responseHandler);
}

function responseHandler(response: Response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response.json();
}

function graphqlErrorHandler(response: any) {
    if (response?.errors?.length > 0) {
        throw Error(`GraphQL ${response.errors[0].errorType}: ${response.errors[0].message}`);
    }
    if (!response.data) {
        throw Error('Entur GraphQL query: no data returned');
    }
    return response;
}

function createGraphqlQuery(query: string, variables: {[key: string]: any}):
    {
        query: string,
        variables?: {[key: string]: any}
    }
    {
    return {
        query: query,
        variables
    }
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
            ).then((data) => data.features || []);
    };
}

function createGetDepartures(clientName: string) {
    const headers = { ...DEFAULT_HEADERS, 'ET-Client-Name': clientName };

    return function getDepartures(
        stopPlaceId: string
    ): Promise<StopPlaceDepartures> {
        const url = 'https://api.entur.io/journey-planner/v2/graphql';

        const query = createGraphqlQuery(getDeparturesFromStopPlacesQuery, {stopPlaceId});
        return post(url, query, headers)
            .then(graphqlErrorHandler)
            .then(response => {
                if (response.data.stopPlace.id !== stopPlaceId) {
                    throw Error('Queried stop place not found in response');
                }
                return response.data.stopPlace;
            });
    }
}

const getDeparturesFromStopPlacesQuery = `
query($stopPlaceId: String!)
{
  stopPlace(id: $stopPlaceId) {
    id
    name
    estimatedCalls(numberOfDepartures: 1) {
      realtime
      expectedDepartureTime
      forBoarding
      destinationDisplay {
        frontText
      }
      serviceJourney {
        journeyPattern {
          line {
            id
            name
            transportMode
          }
        }
      }
    }
  }
}
`

export default createEnturApi;