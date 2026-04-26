import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Partie, PartieDescription, PartieDTO } from '../models/partie.model';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root',
})
export class PartieService {
  constructor(private http: HttpClient) {}
  getAllParties(): Observable<PartieDescription[]> {
    return this.http.get<PartieDescription[]>(environment.apiUrl + '/parties');
  }

  getPartieById(idPartie: number): Observable<Partie> {
    return this.http.get<Partie>(environment.apiUrl + `/parties/${idPartie}`);
  }

  postNewPartie(partieDto: PartieDTO): Observable<PartieDescription[]> {
    return this.http.post<PartieDescription[]>(environment.apiUrl + '/parties', {
      partie: partieDto,
    });
  }
}
