import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';

import { fromEvent, iif, of, Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, filter, mergeMap, pluck, takeUntil, tap } from "rxjs/operators";

import { SearchFacade } from "../../search-facade.service";

@Component({
  selector: 'app-search-field',
  templateUrl: './search-field.component.html',
  styleUrls: ['./search-field.component.scss']
})
export class SearchFieldComponent implements AfterViewInit, OnDestroy {
  @Input() isLoading: boolean
  @ViewChild('inputSearch') inputRef: ElementRef

  public value: string = ''

  private unsubscribe$: Subject<any> = new Subject<any>()

  constructor(private searchFacade: SearchFacade) {}

  ngAfterViewInit(): void {
    fromEvent(this.inputRef.nativeElement, 'keyup')
      .pipe(
        takeUntil(this.unsubscribe$),
        pluck('target', 'value'),
        debounceTime(1000),
        distinctUntilChanged(),
        mergeMap((str: string) => {
          return iif(
            () => this.searchFacade.getCoordinateChecks(str).coordinatePresents,
            of(str).pipe(tap(console.log)),
            of(str).pipe(
              tap((str: string) => str.length < 3 && this.searchFacade.stopRequest()),
              filter((str: string) => str.length > 2),
              tap((str: string) => this.searchFacade.loadSearchItems(str))
            )
          )
        }),
      )
      .subscribe()
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next()
    this.unsubscribe$.complete()
  }

  reset(): void {
    this.value = ''
    this.searchFacade.reset()
  }

  onEnterPressHandler(event: KeyboardEvent): void {
    this.searchFacade.onEnterPressHandler(event)
  }
}
