import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { environment } from "../../environments/environment";
import type { SuccessResponse } from "../api/interfaces/api-response.interface";
import type { ReportsChildRecord } from "../api/interfaces/reports-child.interface";

@Injectable({ providedIn: "root" })
export class LatestUpdateService {
  private readonly reportsUrl = `${environment.apiUrl}/reports-children`;

  constructor(private readonly http: HttpClient) {}

  getLatestReport(childId: string): Observable<ReportsChildRecord | null> {
    const params = new HttpParams().set("page", "1").set("pageSize", "1");

    return this.http
      .get<SuccessResponse<ReportsChildRecord[]>>(`${this.reportsUrl}/child/${childId}`, { params })
      .pipe(map((response) => response.data[0] ?? null));
  }
}
