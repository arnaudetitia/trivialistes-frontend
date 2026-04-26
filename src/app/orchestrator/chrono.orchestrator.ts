import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChronoOrchestrator {
  private canChronoCanBeStartedSource = new Subject<boolean>();
  canChronoCanBeStarted$ = this.canChronoCanBeStartedSource.asObservable();

  private chronoStartedSource = new Subject<void>();
  chonoStarted$ = this.chronoStartedSource.asObservable();

  private chronoFinishedSource = new Subject<void>();
  chonoFinished$ = this.chronoFinishedSource.asObservable();

  private resetChronoSource = new Subject<void>();
  resetChrono$ = this.resetChronoSource.asObservable();

  allowChronoToStart() {
    this.canChronoCanBeStartedSource.next(true);
  }

  blockChronoToStart() {
    this.canChronoCanBeStartedSource.next(false);
  }

  sendChronoIsStarted() {
    this.chronoStartedSource.next();
  }

  sendChronoIsFinished() {
    this.chronoFinishedSource.next();
  }

  resetChrono() {
    this.resetChronoSource.next();
  }
}
