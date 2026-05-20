import { Component, OnInit, signal } from '@angular/core';
import { BoutonRetourComponent } from '../../../shared/bouton-retour/bouton-retour.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { QuestionService } from '../../../services/question.service';
import { Question } from '../../../models/partie.model';
import { tap } from 'rxjs';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'app-gestion-questions',
  imports: [BoutonRetourComponent, MatTableModule, MatGridListModule],
  templateUrl: './gestion-questions.component.html',
  styleUrl: './gestion-questions.component.scss',
})
export class GestionQuestionsComponent implements OnInit {
  questionsDisplayed = signal(new MatTableDataSource<Question>([]));

  displayedColumns: string[] = ['question', 'reponses'];
  constructor(private questionService: QuestionService) {}

  ngOnInit(): void {
    this.questionService
      .getAllQuestions()
      .pipe(
        tap((questions) => {
          this.questionsDisplayed().data = questions;
        }),
      )
      .subscribe();
  }
}
