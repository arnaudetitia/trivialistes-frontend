import { Component, HostListener, OnInit } from '@angular/core';
import { PartieOrchestrator } from '../../../orchestrator/partie.orchestrator';
import { CodeTouches } from '../../../models/code-touches.enum';
import { EquipesStore } from '../../../store/equipes.store';
import { tap } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { ResultatManche } from '../../../models/partie.model';

@Component({
  selector: 'scores',
  imports: [CommonModule, MatTableModule],
  templateUrl: './scores.component.html',
  styleUrl: './scores.component.scss',
})
export class ScoresComponent implements OnInit {
  resultatManches: ResultatManche[] = [];
  scoreGlobal: Map<string, number> = new Map();

  nomEquipes: string[] = [];
  vainqueurPartie: string = '';

  displayedColumns = ['manche', 'scoresEquipeA', 'scoresEquipeB'];

  constructor(
    private partieOrchestrator: PartieOrchestrator,
    private equipeStore: EquipesStore,
  ) {}

  ngOnInit() {
    this.equipeStore
      .getScores()
      .pipe(
        tap((scores) => {
          //Debut Mock Scores
          //let mockScores = new Map<string, number[]>();
          //mockScores.set('Equipe 1', [4, 5, 8, 8, 5, 5]);
          //mockScores.set('Equipe 2', [4, 4, 5, 2, 9, 1]);

          //scores = mockScores;
          //Fin Mock Scores

          this.nomEquipes = Array.from(scores.keys());

          const scoresA = scores.get(this.nomEquipes[0]) || [];
          const scoresB = scores.get(this.nomEquipes[1]) || [];

          for (let i = 0; i < scoresA.length; i++) {
            this.resultatManches.push({
              numeroManche: i + 1,
              scoreEquipeA: scoresA[i],
              scoreEquipeB: scoresB[i],
              equipeChoix: i < 6 ? this.nomEquipes[i % 2] : null,
              mortsubite: i === 6,
            } as ResultatManche);
          }

          this.resultatManches = this.resultatManches.map((res) => {
            let equipeWin: string;
            if (res.scoreEquipeA > res.scoreEquipeB) {
              equipeWin = this.nomEquipes[0];
            } else if (res.scoreEquipeA < res.scoreEquipeB) {
              equipeWin = this.nomEquipes[1];
            } else {
              equipeWin =
                this.nomEquipes.find((nom) => nom.localeCompare(res.equipeChoix) !== 0) || '';
            }
            return {
              ...res,
              vainqueurManche: equipeWin,
            };
          });

          this.scoreGlobal = this.resultatManches.reduce((acc, res) => {
            let nbMancheGagne = acc.get(res.vainqueurManche) || 0;
            acc.set(res.vainqueurManche, nbMancheGagne + 1);
            return acc;
          }, new Map());

          const scoreGagnantPartie = Array.from(this.scoreGlobal.entries()).find(
            ([equipe, nbMancheGagne]) => nbMancheGagne >= 4,
          );
          if (scoreGagnantPartie) {
            this.vainqueurPartie = scoreGagnantPartie[0];
            localStorage.clear();
          }
        }),
      )
      .subscribe();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyEvent(event$: KeyboardEvent) {
    switch (event$.code) {
      case CodeTouches.suivantCode:
        this.partieOrchestrator.passerEtatSuivant();
    }

    event$.stopPropagation();
  }
}
