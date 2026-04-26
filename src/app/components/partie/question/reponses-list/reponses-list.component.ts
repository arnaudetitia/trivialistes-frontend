import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  HostListener,
  inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { ChronoOrchestrator } from '../../../../orchestrator/chrono.orchestrator';
import { tap } from 'rxjs';
import { CodeTouches } from '../../../../models/code-touches.enum';
import { PartieOrchestrator } from '../../../../orchestrator/partie.orchestrator';
import { EquipesStore } from '../../../../store/equipes.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'reponses-list',
  imports: [CommonModule, MatGridListModule],
  templateUrl: './reponses-list.component.html',
  styleUrl: './reponses-list.component.scss',
})
export class ReponsesListComponent implements OnInit {
  private _reponses: string[] = [];

  @Input() admin = false;

  @Input() set reponses(r: string[]) {
    this._reponses = r;
    this.canContinuePartie = false;
    this.reponseDisplay.clear();
    this._reponses.forEach((rep) => {
      this.reponseDisplay.set(rep, this.admin);
    });
    this.reponseDonnee = new Map();
    this.startManche = false;
  }

  @Input() get reponsesList() {
    return this._reponses;
  }

  @Input() mortSubite: boolean = false;

  startManche = false;

  reponseDisplay: Map<string, boolean> = new Map();
  reponseDonnee: Map<string, boolean> = new Map();
  canContinuePartie = false;

  private destroyRef = inject(DestroyRef);

  constructor(
    private chronoOrchestrator: ChronoOrchestrator,
    private partieOrchestrator: PartieOrchestrator,
    private equipeStore: EquipesStore,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.chronoOrchestrator.chonoStarted$
      .pipe(
        tap(() => {
          this.startManche = true;
        }),
      )
      .subscribe();
    this.chronoOrchestrator.chonoFinished$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => {
          this.reponseDonnee = new Map(this.reponseDisplay);
          const scoreManche = Array.from(this.reponseDonnee.values()).filter(
            (reponseDonnee) => reponseDonnee === true,
          ).length;
          this.equipeStore.setScoreEquipe(scoreManche);
          this.cdr.detectChanges();
        }),
      )
      .subscribe();
    this.partieOrchestrator.resetQuestionMortSubite$
      .pipe(
        tap(() => {
          this.canContinuePartie = false;
          this.reponseDisplay.clear();
          this.reponseDonnee = new Map();
          this.startManche = false;
        }),
      )
      .subscribe();
  }

  revealReponses(reponse: string) {
    if (this.admin) {
      return;
    }
    this.reponseDisplay.set(reponse, this.startManche && true);
    if (Array.from(this.reponseDisplay).every(([_, displayed]) => displayed)) {
      this.canContinuePartie = true;
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyEvent(event$: KeyboardEvent) {
    switch (event$.code) {
      case CodeTouches.suivantCode:
        if (this.canContinuePartie) {
          this.partieOrchestrator.passerEtatSuivant();
        }
    }

    event$.stopPropagation();
  }
}
