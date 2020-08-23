import { Injectable } from "@angular/core";

import { Observable, Subscription } from "rxjs";

import { IMapAngularModule } from "./models/MapAngularModule.interface";
import { ILocalization } from "./models/Localization.interface";
import { IResults } from "./models/Results.interface";
import { ICoordinates } from "./models/Coordinates.interface";

import { EN } from "./localization/en";
import { RU } from "./localization/ru";

import { SearchApi } from "./services/api.service";
import { SearchState } from "./services/state.service";
import { SearchCore } from "./services/core.service";

@Injectable()
export class SearchFacade implements IMapAngularModule {
  private searchItemsAPISub: Subscription

  constructor(
    private searchApi: SearchApi,
    private searchState: SearchState,
    private searchCore: SearchCore
  ) {}

  getSearchItems$(): Observable<IResults> {
    return this.searchState.getSearchItems$()
  }

  getLoadingStatus$(): Observable<boolean> {
    return this.searchState.getLoadingStatus$()
  }

  getSearchFilter$(): Observable<string> {
    return this.searchState.getSearchFilter$()
  }

  loadSearchItems(str: string): void {
    this.stopRequest()

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

  setSearchFilter(filter: string): void {
    this.searchState.setSearchFilter(filter)
  }

  stopRequest(): void {
    this.searchState.setLoadingStatus(false)

    if (this.searchItemsAPISub) {
      this.searchItemsAPISub.unsubscribe()
      this.searchItemsAPISub = undefined
    }
  }

  reset(): void {
    this.stopRequest()
    this.searchState.setSearchItems(null)
  }

  onEnterPressHandler(event: KeyboardEvent): void {
    const { value } = event.target as HTMLInputElement

    if (value.length > 2) {
      this.loadSearchItems(value)
    }
  }

  getCoordinatesInfo(str: string): ICoordinates {
    return this.searchCore.getCoordinatesInfo(str)
  }

  GetTranslations(): ILocalization {
    return {
      en: EN,
      ru: RU
    }
  }
}
