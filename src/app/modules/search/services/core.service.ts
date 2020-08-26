import { Injectable } from "@angular/core";

import { IResults } from "../models/Results.interface";
import { ResultsModel } from "../models/Results.model";
import { ICoordinates } from "../models/Coordinates.interface";
import { CoordinatesModel } from "../models/Coordinates.model";
import { IResponse } from "../models/Response.interface";

@Injectable()
export class SearchCore {
  transformSearchItems(items: IResponse): IResults {
    const results: IResults = new ResultsModel()

    console.log('результаты поиска', items)

    results.summaryLength = Object.keys(items).reduce((
      accumulator: number,
      key: string
    ) => {
      accumulator += items[key].length
      return accumulator
    }, 0)

    for (const key in items) {
      const item = items[key]
      switch (key) {
        case 'aerodromSearchUnits':
        case 'waypointSearchUnits':
        case 'navaidSearchUnits':
          results.objects.push(...item)
          break

        case 'geoSearchUnits':
          results.settlements.push(...item)
          break

        case 'airspaceSearchUnits':
          results.restrictedAreas.push(...item)
          break

        case 'routeSearchUnit':
          results.highways.push(...item)
          break

        // todo под locations у Володи пока пустота. Позже обработать еще один кейс
      }
    }
    return results
  }

  getCoordinatesInfo(str: string): ICoordinates {
    const coordinatesModel: ICoordinates = new CoordinatesModel(str)
    coordinatesModel.setChecks()

    return coordinatesModel
  }
}
