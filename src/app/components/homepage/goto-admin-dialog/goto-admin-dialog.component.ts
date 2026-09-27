import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AdminService } from '../../../services/admin.service';
import { catchError, of, tap } from 'rxjs';
import { HomepageComponent } from '../homepage.component';

@Component({
  selector: 'app-goto-admin-dialog.component',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogTitle,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './goto-admin-dialog.component.html',
  styleUrl: './goto-admin-dialog.component.scss',
})
export class GotoAdminDialogComponent {
  readonly dialogRef = inject(MatDialogRef<HomepageComponent>);
  mdpAdminForm: FormGroup;

  errorFromBackend = signal<string | null>(null);

  constructor(
    private formBuilder: FormBuilder,
    private adminService: AdminService,
  ) {
    this.mdpAdminForm = this.formBuilder.group({
      mdpAdmin: ['', [Validators.required]],
    });
  }

  connect() {
    const mdpAdmin = this.mdpAdminForm.get('mdpAdmin')?.value;
    this.errorFromBackend.set(null);
    this.mdpAdminForm.get('mdpAdmin')?.setErrors(null);
    this.adminService
      .connect(mdpAdmin)
      .pipe(
        tap(() => {
          this.dialogRef.close(true);
        }),
        catchError((error) => {
          this.mdpAdminForm.get('mdpAdmin')?.setErrors({ incorrectPassword: true });
          this.errorFromBackend.set(error.error.error);
          return of();
        }),
      )
      .subscribe();
  }
}
