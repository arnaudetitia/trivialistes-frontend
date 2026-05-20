import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Categorie } from '../../../../models/partie.model';
import { CategorieService } from '../../../../services/categorie.service';
import { catchError, tap, throwError } from 'rxjs';
import { GestionQuestionsComponent } from '../gestion-questions.component';
import { QuestionService } from '../../../../services/question.service';

@Component({
  selector: 'app-create-question-dialog.component',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatGridListModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
  ],
  templateUrl: './create-question-dialog.component.html',
  styleUrl: './create-question-dialog.component.scss',
})
export class CreateQuestionDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<GestionQuestionsComponent>);

  questionForm: FormGroup;

  reponseFieldNamesList: string[] = [];
  categories: Categorie[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private categorieService: CategorieService,
    private questionService: QuestionService,
  ) {
    Array.from({ length: 10 }, (_, i) => i + 1).forEach((i) => {
      this.reponseFieldNamesList.push(`reponse${i}`);
    });
    this.questionForm = this.formBuilder.group({
      idCategorie: new FormControl(null, Validators.required),
      question: new FormControl('', Validators.required),
      ...this.reponseFieldNamesList.reduce(
        (acc, fieldName) => {
          acc[fieldName] = new FormControl('', Validators.required);
          return acc;
        },
        {} as { [key: string]: FormControl },
      ),
    });
  }

  ngOnInit() {
    this.categorieService
      .getAllCategories()
      .pipe(
        tap((categories) => {
          this.categories = categories;
        }),
      )
      .subscribe();
  }

  onCreateQuestion() {
    this.questionService
      .createQuestion(
        this.questionForm.value.idCategorie,
        this.questionForm.value.question,
        this.reponseFieldNamesList.map((fieldName) => this.questionForm.value[fieldName]),
      )
      .pipe(
        tap(() => {
          this.dialogRef.close();
        }),
        catchError((error) => {
          console.error('Error creating question:', error);
          return throwError(() => error);
        }),
      )
      .subscribe();
  }
}
