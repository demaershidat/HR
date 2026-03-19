import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class JobService {
  private apiUrl = 'http://localhost:3000/jobs';

  constructor(private http: HttpClient) {}

  getJobs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all?t=${new Date().getTime()}`);
  }

  saveJob(data: any): Observable<any> { 
    return this.http.post(`${this.apiUrl}/add`, data); 
  }

  deleteJob(id: number): Observable<any> { 
    return this.http.delete(`${this.apiUrl}/${id}`); 
  }

  updateJob(id: number, data: any): Observable<any> { 
    return this.http.put(`${this.apiUrl}/${id}`, data); 
  }
}