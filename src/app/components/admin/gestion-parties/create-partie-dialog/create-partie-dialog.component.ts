import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { GestionPartiesComponent } from '../gestion-parties.component';
import { MancheFormControlComponent } from './manche-form-control.component/manche-form-control.component';
import { CategorieService } from '../../../../services/categorie.service';
import { Observable, of } from 'rxjs';
import { Categorie, Question } from '../../../../models/partie.model';
import { mancheValidator } from '../../../../validators/manche.validator';
import { QuestionService } from '../../../../services/question.service';

@Component({
  selector: 'app-create-partie-dialog',
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogTitle,
    MatSelectModule,
    MatOptionModule,
    ReactiveFormsModule,
    MancheFormControlComponent,
  ],
  templateUrl: './create-partie-dialog.component.html',
  styleUrl: './create-partie-dialog.component.scss',
})
export class CreatePartieDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<GestionPartiesComponent>);

  allCategories$: Observable<Categorie[]> = of([]);
  mortSubites$: Observable<Question[]> = of([]);

  partieForm: FormGroup;

  mancheFormNames = Array.from({ length: 6 }, (_, i) => i + 1).map((index) => `manche${index}`);

  constructor(
    private categorieService: CategorieService,
    private questionService: QuestionService,
    private formBuilder: FormBuilder,
  ) {
    this.partieForm = this.formBuilder.group({
      nomPartie: new FormControl('', Validators.required),
      manche1: new FormControl('', [Validators.required, mancheValidator()]),
      manche2: new FormControl('', [Validators.required, mancheValidator()]),
      manche3: new FormControl('', [Validators.required, mancheValidator()]),
      manche4: new FormControl('', [Validators.required, mancheValidator()]),
      manche5: new FormControl('', [Validators.required, mancheValidator()]),
      manche6: new FormControl('', [Validators.required, mancheValidator()]),
      mortSubite: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit() {
    this.allCategories$ = this.categorieService.getAllCategories();
    this.mortSubites$ = this.questionService.getAllMortSubites();
  }

  createPartie() {
    this.dialogRef.close({
      nomPartie: this.partieForm.get('nomPartie')?.value || '',
      questionManches: this.mancheFormNames.reduce((acc, formName) => {
        const val = this.partieForm.get(formName)?.value;
        return [...acc, ...val];
      }, [] as number[]),
      questionMortSubite: this.partieForm.get('mortSubite')?.value || 0,
    });
  }
}
