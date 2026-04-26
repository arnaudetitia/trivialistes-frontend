import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { ChronometreComponent } from './chronometre/chronometre.component';
import { ReponsesListComponent } from './reponses-list/reponses-list.component';
import { Question } from '../../../models/partie.model';
import { ChronoOrchestrator } from '../../../orchestrator/chrono.orchestrator';
import { PartieOrchestrator } from '../../../orchestrator/partie.orchestrator';
import { tap } from 'rxjs';

@Component({
  selector: 'question',
  imports: [CommonModule, ReponsesListComponent, ChronometreComponent],
  templateUrl: './question.component.html',
  styleUrl: './question.component.scss',
})
export class QuestionComponent {
  private _question: Question | null = null;

  musique: HTMLAudioElement | null = null;

  @Input() set questionSet(q: Question | null) {
    this._question = q;
    this.startTransition = false;
    this.questionShown = this.admin;
    this.chronoOrchestrator.resetChrono();
  }

  @Input() get question() {
    return this._question;
  }

  @Input() set musiqueSet(musiqueName: string) {
    if (musiqueName) {
      this.musique = new Audio(`/assets/musiques/${musiqueName}.mp3`);
    }
  }

  @Input() mortSubite: boolean = false;

  @Input() admin: boolean = false;

  startTransition = false;
  questionShown = false;

  constructor(
    private chronoOrchestrator: ChronoOrchestrator,
    private partieOrchestrator: PartieOrchestrator,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.partieOrchestrator.resetQuestionMortSubite$
      .pipe(
        tap(() => {
          this.startTransition = false;
          this.questionShown = this.admin;
          this.chronoOrchestrator.resetChrono();
        }),
      )
      .subscribe();
  }

  revealQuestion() {
    this.startTransition = true;
    setTimeout(() => {
      this.questionShown = true;
      this.cdr.detectChanges();
      this.chronoOrchestrator.allowChronoToStart();
    }, 750);
  }
}
