import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { PartieService } from '../../../services/partie.service';
import { PartieDescription } from '../../../models/partie.model';
import { tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { CreatePartieDialogComponent } from './create-partie-dialog/create-partie-dialog.component';
import { BoutonRetourComponent } from '../../../shared/bouton-retour/bouton-retour.component';

@Component({
  selector: 'app-gestion-parties',
  imports: [MatTableModule, MatButtonModule, MatIconModule, BoutonRetourComponent],
  templateUrl: './gestion-parties.component.html',
  styleUrl: './gestion-parties.component.scss',
})
export class GestionPartiesComponent implements OnInit {
  allParties = signal<PartieDescription[]>([]);

  launchCreatePartieDialog = inject(MatDialog);

  displayedColumns = [
    'nom',
    'manche1',
    'manche2',
    'manche3',
    'manche4',
    'manche5',
    'manche6',
    'mortSubite',
  ];

  private destroyRef = inject(DestroyRef);

  constructor(private partieService: PartieService) {}

  ngOnInit() {
    this.partieService
      .getAllParties()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((parties) => {
          this.allParties.set(parties);
        }),
      )
      .subscribe();
  }

  openModalCreationPartie() {
    const dialogRef = this.launchCreatePartieDialog.open(CreatePartieDialogComponent, {
      width: '50vw',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.partieService
          .postNewPartie({
            nomPartie: result.nomPartie,
            idQuestions: result.questionManches,
            idMortSubite: result.questionMortSubite,
          })
          .pipe(
            tap((parties) => {
              this.allParties.set(parties);
            }),
          )
          .subscribe();
      }
    });
  }
}
