import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import createEnturApi, {clientName} from "../entur-api/entur-api";
import {EstimatedCall, StopPlaceDepartures} from "../entur-api/entur-feature";

const enturApi = createEnturApi(clientName);

@Component({
  selector: 'departures',
  templateUrl: './departures.component.html',
  styleUrls: ['./departures.component.scss']
})
export class DeparturesComponent implements OnInit {

  departures: StopPlaceDepartures | undefined;

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      enturApi.getStopPlace(params.stopId).then(value => {
        this.departures = value;
      });
    });
  }
}
