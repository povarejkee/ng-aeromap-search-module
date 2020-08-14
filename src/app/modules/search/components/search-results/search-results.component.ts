import { Component, Input } from '@angular/core';

import { IResults } from "../../models/Results.interface";

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent {
  @Input() items: IResults
  @Input() searchFilter: string
}

