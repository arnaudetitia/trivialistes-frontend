import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { CodeTouches } from '../../../../models/code-touches.enum';
import { CommonModule } from '@angular/common';
import { ChronoOrchestrator } from '../../../../orchestrator/chrono.orchestrator';
import { tap } from 'rxjs';

@Component({
  selector: 'chronometre',
  imports: [CommonModule],
  templateUrl: './chronometre.component.html',
  styleUrl: './chronometre.component.scss',
})
export class ChronometreComponent implements OnInit {
  @Input() musique: HTMLAudioElement | null = null;

  @Output() onTempsEcoule = new EventEmitter<void>();
  tempsRestant = signal<number>(45);
  tempsTotal = 45;

  canChronoCanBeStarted = false;
  chrono: any;

  constructor(private chronoOrchestrator: ChronoOrchestrator) {}

  ngOnInit() {
    this.chronoOrchestrator.canChronoCanBeStarted$
      .pipe(
        tap((canBeStarted) => {
          this.canChronoCanBeStarted = canBeStarted;
        }),
      )
      .subscribe();
    this.chronoOrchestrator.resetChrono$
      .pipe(
        tap(() => {
          this.tempsRestant.set(this.tempsTotal);
          this.canChronoCanBeStarted = false;
        }),
      )
      .subscribe();
  }

  lancerChrono() {
    if (!this.canChronoCanBeStarted) {
      return;
    }
    if (this.chrono) {
      clearInterval(this.chrono);
    }
    if (this.musique) {
      this.musique.play();
    }
    this.chronoOrchestrator.sendChronoIsStarted();
    this.chrono = setInterval(() => {
      if (this.tempsRestant() >= 0) {
        this.tempsRestant.update((temps) => temps - 0.1);
      } else {
        this.stopperChrono();
        this.chronoOrchestrator.sendChronoIsFinished();
      }
    }, 100);
  }

  stopperChrono() {
    clearInterval(this.chrono);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyEvent($event: KeyboardEvent) {
    switch ($event.code) {
      case CodeTouches.spacebarCode:
        if (this.tempsRestant() > 0) this.lancerChrono();
    }

    $event.stopPropagation();
  }
}
