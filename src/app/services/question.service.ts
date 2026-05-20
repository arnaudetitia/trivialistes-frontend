import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environment';
import { Observable } from 'rxjs';
import { Question } from '../models/partie.model';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  constructor(private http: HttpClient) {}

  getQuestionsByCategorie(idCategorie: number): Observable<Question[]> {
    return this.http.get<Question[]>(environment.apiUrl + `/questions/${idCategorie}`);
  }

  getAllQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(environment.apiUrl + `/questions`);
  }

  getAllMortSubites(): Observable<Question[]> {
    return this.http.get<Question[]>(environment.apiUrl + `/mort-subites`);
  }

  createQuestion(
    idCategorie: number,
    question: string,
    reponses: string[],
  ): Observable<Question[]> {
    return this.http.post<Question[]>(environment.apiUrl + `/questions`, {
      idCategorie,
      question,
      reponses,
    });
  }
}
