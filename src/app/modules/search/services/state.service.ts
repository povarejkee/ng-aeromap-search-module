import { Injectable } from "@angular/core";

import { BehaviorSubject, Observable } from "rxjs";

import { IResults } from "../models/Results.interface";

@Injectable()
export class SearchState {
  private searchItems$: BehaviorSubject<IResults> = new BehaviorSubject<IResults>(null)
  private searchFilter$: BehaviorSubject<string> = new BehaviorSubject<string>('all')
  private isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)

  getSearchItems$(): Observable<IResults> {
    return this.searchItems$.asObservable()
  }

  setSearchItems(items: IResults): void {
    this.searchItems$.next(items)
  }

  getSearchFilter$(): Observable<string> {
    return this.searchFilter$.asObservable()
  }

  setSearchFilter(filter: string): void {
    this.searchFilter$.next(filter)
  }

  getLoadingStatus$(): Observable<boolean> {
    return this.isLoading$.asObservable()
  }

  setLoadingStatus(status: boolean): void {
    this.isLoading$.next(status)
  }
}
