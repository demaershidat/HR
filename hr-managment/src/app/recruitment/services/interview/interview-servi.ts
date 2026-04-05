import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InterviewService {

  private interviewUrl = 'http://localhost:3000/interviews';

  constructor(private http: HttpClient) {}

  getAllInterviews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.interviewUrl}/all?t=${Date.now()}`).pipe(
      catchError(err => {
        console.error('Failed to fetch interviews', err);
        return throwError(() => err);
      })
    );
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