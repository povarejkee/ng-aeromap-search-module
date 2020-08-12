import { Injectable } from "@angular/core";

import { Observable, Subscription } from "rxjs";

import { IMapAngularModule } from "./models/MapAngularModule.interface";
import { ILocalization } from "./models/Localization.interface";
import { EN } from "./localization/en";
import { RU } from "./localization/ru";

import { SearchApi } from "./services/api.service";
import { SearchState } from "./services/state.service";
import { SearchCore } from "./services/core.service";

@Injectable()
export class SearchFacade implements IMapAngularModule{
  public searchItemsAPISub: Subscription

  constructor(
    private searchApi: SearchApi,
    private searchState: SearchState,
    private searchCore: SearchCore
  ) {}

  getSearchItems$(): Observable<any> {
    return this.searchState.getSearchItems$()
  }

  getLoadingStatus$(): Observable<boolean> {
    return this.searchState.getLoadingStatus$()
  }

  getSearchFilter$(): Observable<string> {
    return this.searchState.getSearchFilter$()
  }

  loadSearchItems(str: string): void {
    if (this.searchItemsAPISub) { // todo эта проверка должна быть внутри stopRequest()
      this.searchItemsAPISub.unsubscribe()
      this.searchItemsAPISub = undefined
    }

    this.searchState.setLoadingStatus(true)

    this.searchItemsAPISub = this.searchApi.getSearchItemsByStr(str)
      .subscribe(
        (response: any) => {
          const updatedSearchItems = this.searchCore.transformSearchItems(response.Data)
          this.searchState.setSearchItems(updatedSearchItems)
        },
        (error: ErrorEvent) => {
          console.error(error.error.message) // todo выплёвывать ошибку наверх
          this.searchState.setSearchItems(null)
        },
        () => {
          this.searchState.setLoadingStatus(false) // почему не срабатывает для error? complete() же выполняется даже в случае ошибки!
        }
      )
  }

  clearSearchField(element: HTMLInputElement): void {
    this.searchCore.clearSearchField(element)
    this.searchState.setSearchItems(null)
  }

  setSearchFilter(filter: string): void {
    this.searchState.setSearchFilter(filter)
  }

  stopRequest(): void {
    this.searchState.setLoadingStatus(false)
    this.searchCore.stopRequest(this.searchItemsAPISub)
  }

  onEnterPressHandler(event: KeyboardEvent): void {
    const { value } = event.target as HTMLInputElement

    if (value.length > 2) {
      this.loadSearchItems(value)
    }
  }

  GetTranslations(): ILocalization {
    return {
      en: EN,
      ru: RU
    }
  }
}
