import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private http: HttpClient) {}

  connect(mdpAdmin: string) {
    return this.http.post(`${environment.apiUrl}/admin`, {
      mdpAdmin,
    });
  }
}
