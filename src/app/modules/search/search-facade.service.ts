import { Injectable } from "@angular/core";

import { Observable, Subscription } from "rxjs";

import { IMapAngularModule } from "./models/MapAngularModule.interface";
import { ILocalization } from "./models/Localization.interface";
import { IResults } from "./models/Results.interface";
import { ICoordinates } from "./models/Coordinates.interface";
import { IResponse } from "./models/Response.interface";

import { EN } from "./localization/en";
import { RU } from "./localization/ru";

import { SearchApi } from "./services/api.service";
import { SearchState } from "./services/state.service";
import { SearchCore } from "./services/core.service";
import { MapApi } from "../../../common/api.service";

@Injectable()
export class SearchFacade implements IMapAngularModule {
  private searchItemsAPISub: Subscription

  constructor(
    private searchApi: SearchApi,
    private searchState: SearchState,
    private searchCore: SearchCore,
    private mapApi: MapApi
  ) {}

  getSearchItems$(): Observable<IResults> {
    return this.searchState.getSearchItems$()
  }

  getLoadingStatus$(): Observable<boolean> {
    return this.searchState.getLoadingStatus$()
  }

  loadSearchItems(str: string): void {
    this.stopRequest()

    this.searchState.setLoadingStatus(true)

    this.searchItemsAPISub = this.searchApi.getSearchItemsByStr(str)
      .subscribe(
        (response: IResponse) => {
          const updatedSearchItems = this.searchCore.transformSearchItems(response)
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

  getCoordinatesModel(str: string): ICoordinates {
    return this.searchCore.getCoordinatesModel(str)
  }

  sendCoordinates(coordinatesModel: ICoordinates): void {
    this.reset()

    if (!coordinatesModel.isValid) {
      this.mapApi.execute(
        'DrawOnMapService',
        'ErrorFunction',
        'Неверный формат координат'
      )

      console.warn('Координаты невалидны! (Компонент)')
    }

    if (coordinatesModel.finalCoordinates.length !== 0) {
      this.sendCoordinatesToMapAPI(coordinatesModel.finalCoordinates)
      console.info('Координаты верны!', coordinatesModel.finalCoordinates)
    }
  }

  sendCoordinatesToMapAPI(coordinates: number[][]): void {
    // todo очищать карту перед каждым обновлением
    this.mapApi.execute(
      'DrawOnMapService',
      'RemoveGeomFunction'
    )

    if (coordinates.length === 1) {
      this.mapApi.execute(
        'DrawOnMapService',
        'DrawGeomFunction',
        {
          point: { coordinates: coordinates[0] },
          coordinatePoint: true,
          showText: true
        },
        'baseVectorLayer'
      )
    } else {
      if (
        coordinates[0][0] === coordinates[coordinates.length - 1][0]
        && coordinates[0][1] === coordinates[coordinates.length - 1][1]
      ) {
        this.mapApi.execute(
          'DrawOnMapService',
          'DrawGeomFunction',
          {
            polygon: { coordinates },
            coordinatePoint: true
          },
          'baseVectorLayer'
        )
      } else {
        this.mapApi.execute(
          'DrawOnMapService',
          'DrawGeomFunction',
          {
            arcLine: { coordinates },
            coordinatePoint: true
          },
          'baseVectorLayer'
        )
      }
    }
  }

  GetTranslations(): ILocalization {
    return {
      en: EN,
      ru: RU
    }
  }
}
