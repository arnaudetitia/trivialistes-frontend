import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Categorie } from '../models/partie.model';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root',
})
export class CategorieService {
  constructor(private http: HttpClient) {}
  getAllCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(environment.apiUrl + '/categories');
  }
}
