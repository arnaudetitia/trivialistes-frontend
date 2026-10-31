import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Question } from '../models/partie.model';
import { ImportError } from '../models/import-error.model';

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

  createMortSubite(question: string, reponses: string[]): Observable<Question[]> {
    return this.http.post<Question[]>(environment.apiUrl + `/mort-subites`, {
      question,
      reponses,
    });
  }

  checkImportQuestions(
    csvFileContent: any,
  ): Observable<{ erreurs: ImportError[]; questions: Question[] }> {
    return this.http.post<{ erreurs: ImportError[]; questions: Question[] }>(
      environment.apiUrl + '/import/questions',
      {
        csvFileContent,
        doImport: false,
      },
    );
  }

  importQuestions(
    csvFileContent: any,
  ): Observable<{ erreurs: ImportError[]; questions: Question[] }> {
    return this.http.post<{ erreurs: ImportError[]; questions: Question[] }>(
      environment.apiUrl + '/import/questions',
      {
        csvFileContent,
        doImport: true,
      },
    );
  }

  checkImportMortSubites(
    csvFileContent: any,
  ): Observable<{ erreurs: ImportError[]; questions: Question[] }> {
    return this.http.post<{ erreurs: ImportError[]; questions: Question[] }>(
      environment.apiUrl + '/import/mort-subites',
      {
        csvFileContent,
        doImport: false,
      },
    );
  }

  importMortSubites(
    csvFileContent: any,
  ): Observable<{ erreurs: ImportError[]; questions: Question[] }> {
    return this.http.post<{ erreurs: ImportError[]; questions: Question[] }>(
      environment.apiUrl + '/import/mort-subites',
      {
        csvFileContent,
        doImport: true,
      },
    );
  }
}
