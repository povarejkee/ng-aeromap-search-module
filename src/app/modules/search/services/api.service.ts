import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Observable } from "rxjs";

@Injectable()
export class SearchApi {
  constructor(private http: HttpClient) {}

  getSearchItemsByStr(str: string): Observable<any> {
    return this.http.get<Observable<any>>(`/api/AeroData/geocoder?str=${str}`)
  }
}
