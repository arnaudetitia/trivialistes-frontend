import { Component, inject, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { GestionQuestionsComponent } from '../gestion-questions.component';
import { ImportError } from '../../../../models/import-error.model';
import { QuestionService } from '../../../../services/question.service';
import { Question } from '../../../../models/partie.model';
import { tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-import-questions',
  imports: [CommonModule, MatDialogModule, MatDialogTitle, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './import-questions-dialog.component.html',
  styleUrl: './import-questions-dialog.component.scss',
})
export class ImportQuestionsDialog {
  readonly dialogRef = inject(MatDialogRef<GestionQuestionsComponent>);
  data = inject<{ modeMortSubite: boolean }>(MAT_DIALOG_DATA);
  csvFileContent = signal<string | ArrayBuffer | null>(null);
  isChecking = signal<boolean>(false);
  checkDone = signal<boolean>(false);
  errorsImport = signal<ImportError[]>([]);
  fileName = signal<string>('');

  constructor(private questionService: QuestionService) {}

  onFileSelected($event: Event) {
    this.checkDone.set(false);
    const input = $event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.fileName.set(file.name);

      const reader = new FileReader();
      reader.onload = () => {
        this.csvFileContent.set(reader.result);
      };
      reader.readAsText(file, 'UTF-8');
    }
  }

  checkImportQuestion() {
    this.isChecking.set(true);
    const importObservable = this.data.modeMortSubite
      ? this.questionService.checkImportMortSubites(this.csvFileContent())
      : this.questionService.checkImportQuestions(this.csvFileContent());
    importObservable
      .pipe(
        tap((reponse: { erreurs: ImportError[]; questions: Question[] }) => {
          this.isChecking.set(false);
          this.checkDone.set(true);
          this.errorsImport.set(reponse.erreurs);
        }),
      )
      .subscribe();
  }

  importQuestions() {
    this.isChecking.set(true);
    const importObservable = this.data.modeMortSubite
      ? this.questionService.importMortSubites(this.csvFileContent())
      : this.questionService.importQuestions(this.csvFileContent());
    importObservable
      .pipe(
        tap((reponse: { erreurs: ImportError[]; questions: Question[] }) => {
          this.isChecking.set(false);
          if (reponse.erreurs.length) {
            this.errorsImport.set(reponse.erreurs);
          } else {
            this.dialogRef.close(reponse.questions);
          }
        }),
      )
      .subscribe();
  }
}
