import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  getCurrentPosition() {
    return new Promise<Position>(((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(
            position => resolve(position),
            positionError => reject(positionError)
        )
    ));
  }
}
