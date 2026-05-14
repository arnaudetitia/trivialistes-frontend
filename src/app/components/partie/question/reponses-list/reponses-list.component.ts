import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  HostListener,
  inject,
  Input,
  OnDestroy,
  OnInit,
  signal,
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
    this.reponseDisplay.set(new Map());
    this._reponses.forEach((rep) => {
      this.reponseDisplay().set(rep, this.admin);
    });
    this.reponseDonnee.set(new Map());
    this.startManche = false;
  }

  @Input() get reponsesList() {
    return this._reponses;
  }

  @Input() mortSubite: boolean = false;

  startManche = false;

  reponseDisplay = signal<Map<string, boolean>>(new Map());
  reponseDonnee = signal<Map<string, boolean>>(new Map());
  canContinuePartie = computed(() => {
    return Array.from(this.reponseDisplay()).every(([_, displayed]) => displayed);
  });

  private destroyRef = inject(DestroyRef);

  constructor(
    private chronoOrchestrator: ChronoOrchestrator,
    private partieOrchestrator: PartieOrchestrator,
    private equipeStore: EquipesStore,
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
          this.reponseDonnee.set(new Map(this.reponseDisplay()));
          const scoreManche = Array.from(this.reponseDonnee().values()).filter(
            (reponseDonnee) => reponseDonnee === true,
          ).length;
          this.equipeStore.setScoreEquipe(scoreManche);
        }),
      )
      .subscribe();
    this.partieOrchestrator.resetQuestionMortSubite$
      .pipe(
        tap(() => {
          this.reponseDisplay.set(new Map());
          this.reponseDonnee.set(new Map());
          this.startManche = false;
        }),
      )
      .subscribe();
  }

  revealReponses(reponse: string) {
    if (this.admin) {
      return;
    }
    this.reponseDisplay().set(reponse, this.startManche);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyEvent(event$: KeyboardEvent) {
    switch (event$.code) {
      case CodeTouches.suivantCode:
        if (this.canContinuePartie()) {
          this.partieOrchestrator.passerEtatSuivant();
        }
    }

    event$.stopPropagation();
  }
}
