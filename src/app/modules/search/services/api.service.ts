import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Observable } from "rxjs";

import { IResponse } from "../models/Response.interface";

@Injectable()
export class SearchApi {
  constructor(private http: HttpClient) {}

  getSearchItemsByStr(str: string): Observable<IResponse> {
    return this.http.get<IResponse>(`/api/AeroData/search?str=${str}`)
  }
}
