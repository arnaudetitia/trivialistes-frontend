import { Component, forwardRef, Input, signal } from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { Categorie, Question } from '../../../../../models/partie.model';
import { CommonModule } from '@angular/common';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { QuestionService } from '../../../../../services/question.service';
import { tap } from 'rxjs';

@Component({
  selector: 'manche-form-control',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MancheFormControlComponent),
      multi: true,
    },
  ],
  imports: [CommonModule, MatSelectModule, MatOptionModule, ReactiveFormsModule],
  templateUrl: './manche-form-control.component.html',
  styleUrl: './manche-form-control.component.scss',
})
export class MancheFormControlComponent implements ControlValueAccessor {
  @Input() listeCategories: Categorie[] = [];

  @Input() mancheIndex: number = 0;

  value: number[] = [0, 0];

  formNameList = [
    ['categorie1', 'question1'],
    ['categorie2', 'question2'],
  ];

  questionsLists = signal<Question[][]>([[], []]);

  mancheForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private questionService: QuestionService,
  ) {
    this.mancheForm = this.fb.group({
      categorie1: new FormControl(''),
      question1: new FormControl({ value: '', disabled: true }),
      categorie2: new FormControl(''),
      question2: new FormControl({ value: '', disabled: true }),
    });
  }

  onChange = (val: number[]) => {};
  onTouched = () => {};

  writeValue(value: number[]): void {
    if (value) {
      this.value = value;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onCategorieSelected($event: MatSelectChange, index: number) {
    this.mancheForm.get(this.formNameList[index][1])?.enable();
    this.questionService
      .getQuestionsByCategorie($event.value)
      .pipe(
        tap((questions) => {
          this.questionsLists.update((tab) => {
            tab[index] = questions;
            return [...tab];
          });
        }),
      )
      .subscribe();
  }

  onQuestionSelected($event: MatSelectChange, index: number) {
    this.value[index] = $event.value;
    this.onChange(this.value);
  }
}
