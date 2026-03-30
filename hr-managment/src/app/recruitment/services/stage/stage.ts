import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StageService {
  private apiUrl = 'http://localhost:3000/stages';

  constructor(private http: HttpClient) {}

  getStages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  addStage(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, data);
  }

  updateStage(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteStage(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  checkStageHasCandidates(stageId: number): Observable<{hasCandidates: boolean}> {
    return this.http.get<{hasCandidates: boolean}>(`${this.apiUrl}/has-candidates/${stageId}`);
  }

  checkEvaluation(candidateId: number, stageId: number): Observable<{evaluated: boolean}> {
    return this.http.get<{evaluated: boolean}>(`${this.apiUrl}/check-evaluation/${candidateId}/${stageId}`);
  }
}