import createEnturApi from './entur-api';

const coordinates = {
   accuracy: 0,
   altitude: null,
   altitudeAccuracy: null,
   heading: null,
   speed: null,
   latitude: 2, longitude: 5};

it('should succeed', (t) => {
   let enturApi = createEnturApi();
   let result = enturApi.getStopPlacesByPosition(coordinates);
   expect(result).toBeTruthy();
});