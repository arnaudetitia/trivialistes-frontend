import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { EtatPartie } from '../models/etat-partie.enum';
import { EtatPartieKeys } from '../models/etat-partie-keys.enum';

@Injectable({
  providedIn: 'root',
})
export class PartieOrchestrator {
  etatPartie: EtatPartie = EtatPartie.CHOIX_CATEGORIE;

  private etatPartieSouce = new Subject<EtatPartie>();
  etatPartie$ = this.etatPartieSouce.asObservable();

  private resetQuestionMortSubiteSource = new Subject<void>();
  resetQuestionMortSubite$ = this.resetQuestionMortSubiteSource.asObservable();

  passerEtatSuivant() {
    switch (this.etatPartie) {
      case EtatPartie.CHOIX_CATEGORIE:
        this.etatPartie = EtatPartie.QUESTION_1;
        break;
      case EtatPartie.QUESTION_1:
        this.etatPartie = EtatPartie.QUESTION_2;
        break;
      case EtatPartie.QUESTION_2:
        this.etatPartie = EtatPartie.SCORES;
        break;
      case EtatPartie.SCORES:
        this.etatPartie = EtatPartie.CHOIX_CATEGORIE;
        break;
      default:
        break;
    }
    localStorage.setItem(EtatPartieKeys.ETAPE_PARTIE, this.etatPartie);
    this.etatPartieSouce.next(this.etatPartie);
  }

  resetQuestionMortSubite() {
    this.resetQuestionMortSubiteSource.next();
  }
}
