import { Injectable } from "@angular/core";

import { ResultsModel } from "../models/Results.model";
import {Subscription} from "rxjs";

@Injectable()
export class SearchCore {
  transformSearchItems(items: any): any {
    const results: any = new ResultsModel()
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

  clearSearchField(element: HTMLInputElement): void {
    element.value = '' // todo сделать эту логику в шаблоне
  }

  stopRequest(subscription: Subscription): void {
    subscription.unsubscribe() // лишнее
  }
}
