import { Component, inject, OnInit, signal } from '@angular/core';
import { BoutonRetourComponent } from '../../../shared/bouton-retour/bouton-retour.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { QuestionService } from '../../../services/question.service';
import { Question } from '../../../models/partie.model';
import { tap } from 'rxjs';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CreateQuestionDialogComponent } from './create-question-dialog/create-question-dialog.component';

@Component({
  selector: 'app-gestion-questions',
  imports: [
    BoutonRetourComponent,
    MatTableModule,
    MatGridListModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './gestion-questions.component.html',
  styleUrl: './gestion-questions.component.scss',
})
export class GestionQuestionsComponent implements OnInit {
  questionsDisplayed = signal(new MatTableDataSource<Question>([]));

  displayedColumns: string[] = ['question', 'reponses'];

  createQuestionDialog = inject(MatDialog);

  constructor(private questionService: QuestionService) {}

  ngOnInit(): void {
    this.refreshQuestions();
  }

  refreshQuestions() {
    this.questionService
      .getAllQuestions()
      .pipe(
        tap((questions) => {
          this.questionsDisplayed().data = questions;
        }),
      )
      .subscribe();
  }

  openModalCreationQuestion() {
    const dialogRef = this.createQuestionDialog.open(CreateQuestionDialogComponent, {
      width: '75vw',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.refreshQuestions();
    });
  }
}
