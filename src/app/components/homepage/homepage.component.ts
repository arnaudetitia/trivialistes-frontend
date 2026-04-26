import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LaunchPartieDialog } from './launch-partie/launch-partie.component';
import { PartieStore } from '../../store/partie.store';
import { Router, RouterModule } from '@angular/router';
import { EquipesStore } from '../../store/equipes.store';

@Component({
  selector: 'app-homepage',
  imports: [MatButtonModule, MatDialogModule, RouterModule],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent {
  launchPartieDialog = inject(MatDialog);

  constructor(
    private partieStore: PartieStore,
    private equipeStore: EquipesStore,
    private router: Router,
  ) {}

  openDialog() {
    const dialogRef = this.launchPartieDialog.open(LaunchPartieDialog, {
      width: '750px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.partieStore.setIdPartie(result.idPartie);
        this.equipeStore.initEquipeScore(result.equipeA, result.equipeB);
        this.router.navigate(['partie']);
      }
    });
  }
}
