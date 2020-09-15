import { Component, OnInit } from '@angular/core'

import { Observable } from "rxjs"

import { IResults } from "../../models/Results.interface"

import { SearchFacade } from "../../search-facade.service"

@Component({
  selector: 'app-search-container',
  templateUrl: './search-container.component.html',
  styleUrls: ['./search-container.component.scss']
})
export class SearchContainerComponent implements OnInit {
  public searchItems$: Observable<IResults>
  public isLoading$: Observable<boolean>

  constructor(private searchFacade: SearchFacade) {}

  ngOnInit(): void {
    this.searchItems$ = this.searchFacade.getSearchItems$()
    this.isLoading$ = this.searchFacade.getLoadingStatus$()
  }
}
