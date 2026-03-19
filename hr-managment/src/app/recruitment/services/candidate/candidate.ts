import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CandidateService {
  private apiUrl = 'http://localhost:3000/candidates';
  private interviewUrl = 'http://localhost:3000/interviews'; // رابط المقابلات المنفصل

  constructor(private http: HttpClient) {}

  getAllCandidates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  updateCandidate(id: number, data: FormData | any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  addCandidate(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, formData);
  }

  deleteCandidate(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  deleteBulkCandidates(ids: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk-delete`, { ids });
  }


  getAllInterviews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.interviewUrl}/all`);
  }

  createInterview(data: any): Observable<any> {
    return this.http.post(`${this.interviewUrl}/add`, data);
  }

  updateInterview(id: number, data: any): Observable<any> {
    return this.http.put(`${this.interviewUrl}/${id}`, data);
  }

  deleteInterview(id: number): Observable<any> {
    return this.http.delete(`${this.interviewUrl}/${id}`);
  }
}