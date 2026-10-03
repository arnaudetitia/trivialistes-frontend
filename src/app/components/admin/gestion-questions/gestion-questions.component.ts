import { Component, inject, OnInit, signal } from '@angular/core';
import { BoutonRetourComponent } from '../../../shared/bouton-retour/bouton-retour.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { QuestionService } from '../../../services/question.service';
import { Partie, PartieDescription, Question, QuestionDesc } from '../../../models/partie.model';
import { combineLatest, tap } from 'rxjs';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CreateQuestionDialogComponent } from './create-question-dialog/create-question-dialog.component';
import { FiltrerQuestionsComponent } from './filtrer-questions/filtrer-questions.component';
import { FiltreType } from '../../../models/filtre-type.enum';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gestion-questions',
  imports: [
    CommonModule,
    MatSlideToggleModule,
    FormsModule,
    BoutonRetourComponent,
    FiltrerQuestionsComponent,
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

  questionsManche = signal<Question[]>([]);
  questionsMortSubite = signal<Question[]>([]);

  displayedColumns = signal<string[]>(['categorie', 'question', 'reponses']);

  createQuestionDialog = inject(MatDialog);

  isModeMortSubite: boolean = false;

  constructor(private questionService: QuestionService) {}

  ngOnInit(): void {
    this.refreshQuestions();
    this.questionsDisplayed().filterPredicate = (question: Question, filter: string) => {
      const filtre = JSON.parse(filter);
      switch (filtre.typeFiltre) {
        case FiltreType.CATEGORIE:
          return question.idCategorie === filtre.value;
        case FiltreType.PARTIE:
          const partieFromFiltre = filtre.value as PartieDescription;
          const questionIds = partieFromFiltre.listeQuestions.map((q) => q.idQuestion);
          const mortSubiteId = partieFromFiltre.idMortSubite;
          return this.isModeMortSubite
            ? mortSubiteId === question.id
            : questionIds.includes(Number(question.id));
        case FiltreType.TEXTE:
          return (
            question.question.toLowerCase().includes((filtre.value as string).toLowerCase()) ||
            question.reponses.some((reponse) =>
              reponse.toLowerCase().includes((filtre.value as string).toLowerCase()),
            )
          );
        default:
          return true;
      }
    };
  }

  refreshQuestions() {
    combineLatest([
      this.questionService.getAllQuestions(),
      this.questionService.getAllMortSubites(),
    ])
      .pipe(
        tap(([questions, mortsSubites]) => {
          this.questionsManche.set(questions);
          this.questionsMortSubite.set(mortsSubites);

          this.questionsDisplayed().data = this.isModeMortSubite
            ? this.questionsMortSubite()
            : this.questionsManche();
        }),
      )
      .subscribe();
  }

  openModalCreationQuestion() {
    const dialogRef = this.createQuestionDialog.open(CreateQuestionDialogComponent, {
      width: '75vw',
      disableClose: true,
      data: {
        modeMortSubite: this.isModeMortSubite,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshQuestions();
      }
    });
  }

  filterQuestions(filtre: { typeFiltre: FiltreType; value: string | number | PartieDescription }) {
    this.questionsDisplayed().filter = JSON.stringify(filtre);
  }

  switchMode() {
    this.questionsDisplayed().data = this.isModeMortSubite
      ? this.questionsMortSubite()
      : this.questionsManche();
    this.refreshQuestions();
    this.displayedColumns.set(
      this.isModeMortSubite ? ['question', 'reponses'] : ['categorie', 'question', 'reponses'],
    );
  }
}
