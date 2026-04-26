import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { EtatPartieKeys } from '../models/etat-partie-keys.enum';

@Injectable({
  providedIn: 'root',
})
export class EquipesStore {
  equipeList: string[] = [];
  equipeScore = new Map();
  indexEquipeEnJeu = 0;

  equipeEnJeuSource = new BehaviorSubject<string>(
    localStorage.getItem(EtatPartieKeys.EQUIPE_EN_JEU) || '',
  );
  equipeEnJeu$ = this.equipeEnJeuSource.asObservable();

  initEquipeScore(equipeA: string, equipeB: string) {
    this.equipeList = [equipeA, equipeB];
    this.equipeEnJeuSource.next(this.equipeList[this.indexEquipeEnJeu]);
    this.equipeScore.set(equipeA, []);
    this.equipeScore.set(equipeB, []);
    localStorage.setItem(EtatPartieKeys.EQUIPES, JSON.stringify(this.equipeList));
    localStorage.setItem(EtatPartieKeys.EQUIPE_EN_JEU, this.equipeList[this.indexEquipeEnJeu]);
    localStorage.setItem(EtatPartieKeys.SCORES_EQUIPES, JSON.stringify(this.equipeScore));
  }

  resetEquipeScores() {
    const savedEquipes = localStorage.getItem(EtatPartieKeys.EQUIPES);
    if (savedEquipes) {
      this.equipeList = JSON.parse(savedEquipes);
      const savedEquipeEnJeu = localStorage.getItem(EtatPartieKeys.EQUIPE_EN_JEU);
      this.indexEquipeEnJeu = this.equipeList.indexOf(savedEquipeEnJeu || '');
    }
    const savedScores = localStorage.getItem(EtatPartieKeys.SCORES_EQUIPES);
    if (savedScores) this.equipeScore = JSON.parse(savedScores);
  }

  changerEquipeEnJeu() {
    if (this.equipeList.length === 0) {
      this.resetEquipeScores();
    }
    this.indexEquipeEnJeu = 1 - this.indexEquipeEnJeu;
    localStorage.setItem(EtatPartieKeys.EQUIPE_EN_JEU, this.equipeList[this.indexEquipeEnJeu]);
    this.equipeEnJeuSource.next(this.equipeList[this.indexEquipeEnJeu]);
  }

  setScoreEquipe(scoreManche: number) {
    if (!this.equipeScore.size) {
      const savedScoresEquipes = localStorage.getItem(EtatPartieKeys.SCORES_EQUIPES);
      if (savedScoresEquipes) {
        this.equipeScore = new Map(JSON.parse(savedScoresEquipes));
      }
    }
    const equipeInPlay = this.equipeList[this.indexEquipeEnJeu];
    this.equipeScore.set(equipeInPlay, [...this.equipeScore.get(equipeInPlay), scoreManche]);
    localStorage.setItem(
      EtatPartieKeys.SCORES_EQUIPES,
      JSON.stringify(Array.from(this.equipeScore.entries())),
    );
  }

  getScores(): Observable<Map<string, number[]>> {
    if (!this.equipeScore.size) {
      const savedScoresEquipes = localStorage.getItem(EtatPartieKeys.SCORES_EQUIPES);
      if (savedScoresEquipes) {
        this.equipeScore = new Map(JSON.parse(savedScoresEquipes));
      }
    }
    return of(this.equipeScore);
  }
}
