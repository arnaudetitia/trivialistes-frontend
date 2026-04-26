import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HomepageComponent } from '../homepage.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PartieDescription } from '../../../models/partie.model';
import { PartieService } from '../../../services/partie.service';
import { tap } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-launch-partie',
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
  ],
  templateUrl: './launch-partie.component.html',
  styleUrl: './launch-partie.component.scss',
})
export class LaunchPartieDialog implements OnInit {
  readonly dialogRef = inject(MatDialogRef<HomepageComponent>);
  partieDescriptions: PartieDescription[] = [];
  partieForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private partieService: PartieService,
  ) {
    this.partieForm = this.formBuilder.group({
      equipeA: ['', Validators.required],
      equipeB: ['', Validators.required],
      idPartie: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.partieService
      .getAllParties()
      .pipe(
        tap((descriptions) => {
          this.partieDescriptions = descriptions;
        }),
      )
      .subscribe();
  }

  lancerPartie() {
    this.dialogRef.close({
      equipeA: this.partieForm.value.equipeA,
      equipeB: this.partieForm.value.equipeB,
      idPartie: this.partieForm.value.idPartie,
    });
  }
}
