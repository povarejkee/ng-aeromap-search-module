import { Injectable } from "@angular/core";

import { tap } from "rxjs/operators";
import { Observable } from "rxjs";

import { IMapAngularModule } from "./models/MapAngularModule.interface";
import { ILocalization } from "./models/Localization.interface";
import { EN } from "./localization/en";
import { RU } from "./localization/ru";

import { SearchApi } from "./services/api.service";
import { SearchState } from "./services/state.service";
import { SearchCore } from "./services/core.service";

@Injectable()
export class SearchFacade implements IMapAngularModule{
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

  loadSearchItems(str: string): Observable<any> {
    this.searchState.setLoadingStatus(true)

    return this.searchApi.getSearchItemsByStr(str)
      .pipe(
            tap((response: any) => {
            const updatedSearchItems = this.searchCore.transformSearchItems(response.Data)

            this.searchState.setSearchItems(updatedSearchItems)
            this.searchState.setLoadingStatus(false)

              // todo обработать ошибку
          })
      )
  }

  clearSearchField(element: HTMLInputElement): void {
    this.searchCore.clearSearchField(element)
    this.searchState.setSearchItems(null)
  }

  setSearchFilter(filter: string): void {
    this.searchState.setSearchFilter(filter)
  }

  GetTranslations(): ILocalization {
    return {
      en: EN,
      ru: RU
    }
  }
}
