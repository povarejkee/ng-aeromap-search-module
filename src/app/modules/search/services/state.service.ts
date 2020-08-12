import { Injectable } from "@angular/core";

import { BehaviorSubject, Observable } from "rxjs";

@Injectable()
export class SearchState {
  private searchItems$ = new BehaviorSubject<any>(null)
  private searchFilter$ = new BehaviorSubject<string>('all')
  private isLoading$ = new BehaviorSubject<boolean>(false)

  getSearchItems$(): Observable<any> {
    return this.searchItems$.asObservable()
  }

  setSearchItems(items: any): void {
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
