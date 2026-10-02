import { Component, inject, OnInit, signal } from '@angular/core';
import { BoutonRetourComponent } from '../../../shared/bouton-retour/bouton-retour.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { QuestionService } from '../../../services/question.service';
import { Question, QuestionDesc } from '../../../models/partie.model';
import { combineLatest, map, tap } from 'rxjs';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CreateQuestionDialogComponent } from './create-question-dialog/create-question-dialog.component';
import { FiltrerQuestionsComponent } from './filtrer-questions/filtrer-questions.component';
import { FiltreType } from '../../../models/filtre-type.enum';
import { PartieService } from '../../../services/partie.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gestion-questions',
  imports: [
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

  constructor(
    private questionService: QuestionService,
    private partieService: PartieService,
  ) {}

  ngOnInit(): void {
    this.refreshQuestions();
    this.questionsDisplayed().filterPredicate = (question: Question, filter: string) => {
      const filtre = JSON.parse(filter);
      switch (filtre.typeFiltre) {
        case FiltreType.CATEGORIE:
          return question.idCategorie === filtre.value;
        case FiltreType.PARTIE:
          const questionIds = (filtre.value as QuestionDesc[]).map((q) => q.idQuestion);
          return questionIds.includes(Number(question.id));
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
          this.questionsDisplayed().data = this.questionsManche();
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

  filterQuestions(filtre: { typeFiltre: FiltreType; value: string | number | QuestionDesc[] }) {
    this.questionsDisplayed().filter = JSON.stringify(filtre);
  }

  switchMode() {
    this.questionsDisplayed().data = this.isModeMortSubite
      ? this.questionsMortSubite()
      : this.questionsManche();
    this.questionsDisplayed().filter = JSON.stringify({});
    this.displayedColumns.set(
      this.isModeMortSubite ? ['question', 'reponses'] : ['categorie', 'question', 'reponses'],
    );
  }
}
