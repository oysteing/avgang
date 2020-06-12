import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import createEnturApi, {clientName} from "../entur-api/entur-api";
import {StopPlaceDepartures} from "../entur-api/entur-feature";

const enturApi = createEnturApi(clientName);

@Component({
  selector: 'departures',
  templateUrl: './departures.component.html',
  styleUrls: ['./departures.component.scss']
})
export class DeparturesComponent implements OnInit {

  departures: StopPlaceDepartures | undefined;

  constructor(private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      enturApi.getStopPlace(params.stopId).then(value => {
        this.departures = value;
      });
    });
  }

    velgStoppested() {
      this.router.navigate(['/stops'], {skipLocationChange: true});
    }

  formatTime(timeString: string) {
    const time = new Date(timeString);
    const now = new Date();
    const difference = Math.floor((time.getTime() - now.getTime())/1000/60);
    if (difference < 1) {
      return "nå";
    } else if (difference < 60) {
      return "om " + difference + " min";
    } else {
      return this.str_pad(time.getHours()) + ":" + this.str_pad(time.getMinutes());
    }
  }

  private str_pad(n: number) {
    return String("00" + n).slice(-2);
  }
}
