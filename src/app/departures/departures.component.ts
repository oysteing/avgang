import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import createEnturApi, {clientName} from "../entur-api/entur-api";

const enturApi = createEnturApi(clientName);

@Component({
  selector: 'departures',
  templateUrl: './departures.component.html',
  styleUrls: ['./departures.component.scss']
})
export class DeparturesComponent implements OnInit {

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log('Fetch stop', params.stopId);
      enturApi.getStopPlace(params.stopId).then(value => {
        console.log('Stop place fetched', value);
      });
    });
  }
}
