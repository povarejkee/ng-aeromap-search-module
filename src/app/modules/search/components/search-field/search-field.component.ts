import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { fromEvent, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged, filter, pluck, tap } from "rxjs/operators";

import { SearchFacade } from "../../search-facade.service";

@Component({
  selector: 'app-search-field',
  templateUrl: './search-field.component.html',
  styleUrls: ['./search-field.component.scss']
})
export class SearchFieldComponent implements AfterViewInit, OnDestroy {
  @Input() isLoading: boolean
  @ViewChild('inputSearch') inputRef: ElementRef

  private fromEventSub: Subscription

  constructor(private searchFacade: SearchFacade) {}

  ngAfterViewInit(): void {
    this.fromEventSub = fromEvent(this.inputRef.nativeElement, 'keyup')
      .pipe(
        debounceTime(1000),
        pluck('target', 'value'),
        tap((str: string) => str.length < 3 && this.searchFacade.stopRequest()), // todo перенести логику в фасад (убрать лишнее из core)
        filter((str: string) => str.length > 2),
        distinctUntilChanged(),
        tap((str: string) => this.searchFacade.loadSearchItems(str))
      )
      .subscribe()
  }

  ngOnDestroy(): void {
    if (this.fromEventSub) {
      this.fromEventSub.unsubscribe()
    }
  }

  clearSearchField(element: HTMLInputElement): void {
    this.searchFacade.clearSearchField(element)
    this.searchFacade.stopRequest()
  }


  onEnterPressHandler(event: KeyboardEvent): void {
    this.searchFacade.onEnterPressHandler(event)
  }
}
