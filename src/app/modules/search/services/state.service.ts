import { Injectable } from "@angular/core"

import { BehaviorSubject, Observable } from "rxjs"

import { IResults } from "../models/Results.interface"

@Injectable()
export class SearchState {
  private searchItems$: BehaviorSubject<IResults> = new BehaviorSubject<IResults>(null)
  private isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)

  public getSearchItems$(): Observable<IResults> {
    return this.searchItems$.asObservable()
  }

  public setSearchItems(items: IResults): void {
    this.searchItems$.next(items)
  }

  public getLoadingStatus$(): Observable<boolean> {
    return this.isLoading$.asObservable()
  }

  public setLoadingStatus(status: boolean): void {
    this.isLoading$.next(status)
  }
}
