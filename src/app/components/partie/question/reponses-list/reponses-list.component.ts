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
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'reponses-list',
  imports: [CommonModule, MatSlideToggleModule, MatGridListModule],
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
    this.modeRattrapage.set(false);
    this.enableRattrapage.set(false);
    this.startManche = false;
  }

  @Input() get reponsesList() {
    return this._reponses;
  }

  enableRattrapage = signal<boolean>(false);
  modeRattrapage = signal<boolean>(false);

  @Input() mortSubite: boolean = false;

  startManche = false;

  reponseDisplay = signal<Map<string, boolean>>(new Map());
  reponseDonnee = signal<Map<string, boolean>>(new Map());
  reponseARattraper = signal<Map<string, boolean>>(new Map());
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
          this.enableRattrapage.set(true);
          this.reponseDonnee.set(new Map(this.reponseDisplay()));
          const reponsesARattraper = new Map(this.reponseDonnee());
          reponsesARattraper.forEach((value, reponse) => {
            reponsesARattraper.set(reponse, !value);
          });
          this.reponseARattraper.set(reponsesARattraper);
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
    this.reponseDisplay.update((display: Map<string, boolean>) =>
      new Map(display).set(reponse, this.startManche),
    );
  }

  rattraperReponse(event: MatSlideToggleChange, reponse: string) {
    this.reponseDonnee.update((reponses) => new Map(reponses).set(reponse, event.checked));
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyEvent(event$: KeyboardEvent) {
    switch (event$.code) {
      case CodeTouches.suivantCode:
        if (this.canContinuePartie() && !this.modeRattrapage()) {
          const scoreManche = Array.from(this.reponseDonnee().values()).filter(
            (reponseDonnee) => reponseDonnee === true,
          ).length;
          this.equipeStore.setScoreEquipe(scoreManche);
          this.partieOrchestrator.passerEtatSuivant();
        }
        break;
      case CodeTouches.rattrapagePoints:
        this.modeRattrapage.update((value) => this.enableRattrapage() && !value);
        break;
    }

    event$.stopPropagation();
  }
}
