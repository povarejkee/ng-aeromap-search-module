import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from "rxjs";

import { SearchFacade } from "../../search-facade.service";

@Component({
  selector: 'app-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss']
})
export class SearchFilterComponent implements OnInit, OnDestroy {
  public searchItems: any

  private getSearchItemsSub: Subscription

  constructor(private searchFacade: SearchFacade) {}

  ngOnInit(): void {
    this.getSearchItemsSub = this.searchFacade.getSearchItems$()
      .subscribe((items: any) => this.searchItems = items)
  }

  ngOnDestroy(): void {
    if (this.getSearchItemsSub) this.getSearchItemsSub.unsubscribe()
  }

  setSearchFilter(eventEmitter): void {
    this.searchFacade.setSearchFilter(eventEmitter.value)
  }
}
