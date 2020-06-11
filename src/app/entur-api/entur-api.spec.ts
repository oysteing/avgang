const fetch = require('node-fetch');
if (!globalThis.fetch) {
    globalThis.fetch = fetch;
}
import createEnturApi, {clientName} from "./entur-api";

const enturApi = createEnturApi(clientName);

const coordinates = {
    accuracy: 0,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
    latitude: 59.911491, longitude: 10.757933
};
const stopPlace = 'NSR:StopPlace:548';

describe('Entur API', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

    it('reverse geocoding should succeed', () => {
        return enturApi.getStopPlacesByPosition(coordinates).then((result) => {
            expect(result.length).toEqual(10);
            expect(result[0].properties.name).toEqual('Oslo bussterminal');
        });
    });

    it('should handle errors', async () => {
        const erroneousCoordinates = {latitude: 'to', longitude: 5};

        // @ts-ignore
        await expectAsync(enturApi.getStopPlacesByPosition(erroneousCoordinates)).toBeRejectedWithError();
    });

    it('getStopPlace should return departures', () => {
        return enturApi.getStopPlace(stopPlace).then((result) => {
            expect(result.length).toEqual(5);
            expect(result[0].serviceJourney.journeyPattern.line.transportMode).toEqual('rail');
        });
    });
});
