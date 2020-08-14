import { Injectable } from "@angular/core";

import { IResults } from "../models/Results.interface";
import { ResultsModel } from "../models/Results.model";
import { ICoordinatesRegExps } from "../models/CoordinatesRegExps.interface";
import { CoordinatesRegExpsModel } from "../models/CoordinatesRegExps.model";
import { ICoordinateChecks } from "../models/ICoordinateChecks.interface";

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

  getCoordinateChecks(str: string): ICoordinateChecks {
    const coordinatesRegExps: ICoordinatesRegExps = new CoordinatesRegExpsModel(str)
    const checks: ICoordinateChecks = {
      coordinatePresents: false,
      coordinateIsCorrect: false
    }

    if (str.length > 2) {
      checks.coordinatePresents = coordinatesRegExps.partialRegExps.some((exp: RegExp) => {
        return exp.test(str)
      })

      if (checks.coordinatePresents) {
        checks.coordinateIsCorrect = coordinatesRegExps.strictRegExps.some((exp: RegExp) => {
          return exp.test(str)
        })
      }
    }

    console.log(coordinatesRegExps.strictRegExps, checks)

    return checks
  }
}
