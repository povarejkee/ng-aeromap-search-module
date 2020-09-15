import { Component, Input, OnDestroy, OnInit } from '@angular/core'

import { Subject } from "rxjs"
import { takeUntil } from "rxjs/operators"

import { IResults } from "../../models/Results.interface"

import { SearchFacade } from "../../search-facade.service"

@Component({
  selector: 'app-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss']
})
export class SearchFilterComponent implements OnInit, OnDestroy {
  @Input() public searchItems: IResults

  private unsubscribe$: Subject<any> = new Subject<any>()

  constructor(private searchFacade: SearchFacade) {}

  ngOnInit(): void {
   this.searchFacade.getSearchItems$()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((items: IResults) => this.searchItems = items)
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next()
    this.unsubscribe$.complete()
  }
}
