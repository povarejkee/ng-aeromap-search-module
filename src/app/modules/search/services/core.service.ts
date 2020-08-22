import { Injectable } from "@angular/core";

import { IResults } from "../models/Results.interface";
import { ResultsModel } from "../models/Results.model";
import { ICoordinates } from "../models/Coordinates.interface";
import { CoordinatesModel } from "../models/Coordinates.model";

@Injectable()
export class SearchCore {
  transformSearchItems(items: any): IResults {
    const results: IResults = new ResultsModel()
    results.summaryLength = items.length

      items.forEach((item: any) => {
        switch (item.type) {
          case 'waypoint':
          case 'navaid':
          case 'procedure_point':
          case 'aerodrome':
          case 'obstacle':
            results.objects.push(item)
            break

          case 'river':
          case 'lake':
          case 'city':
          case 'notam':
            results.settlements.push(item)
            break

          case 'notam':
          case 'fir_airspace':
          case 'restricted_airspace':
          case 'airspace':
            results.restrictedAreas.push(item)
            break

          case 'procedure':
          case 'route_segment':
          case 'route':
            results.highways.push(item)
            break

          case 'real_track':
          case 'plan_track':
            results.locations.push(item)
            break
        }
      })

    return results
  }

  getCoordinateChecks(str: string): boolean {
    const coordinatesModel: ICoordinates = new CoordinatesModel(str)

    coordinatesModel.setChecks()

    return coordinatesModel.coordinatesPresents
  }
}
