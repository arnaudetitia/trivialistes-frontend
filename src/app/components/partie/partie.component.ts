import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionComponent } from './question/question.component';
import { ChoixCategorieComponent } from './choix-categorie/choix-categorie.component';
import { PartieStore } from '../../store/partie.store';
import { Question } from '../../models/partie.model';
import { map, Observable, of, tap } from 'rxjs';
import { PartieOrchestrator } from '../../orchestrator/partie.orchestrator';
import { ScoresComponent } from './scores/scores.component';
import { EquipesStore } from '../../store/equipes.store';
import { EtatPartie, getEtapePartieFromString } from '../../models/etat-partie.enum';
import { EtatPartieKeys } from '../../models/etat-partie-keys.enum';

@Component({
  selector: 'app-partie',
  imports: [CommonModule, ChoixCategorieComponent, QuestionComponent, ScoresComponent],
  templateUrl: './partie.component.html',
  styleUrls: ['./partie.component.scss'],
})
export class PartieComponent implements OnInit {
  etatPartie: EtatPartie = EtatPartie.CHOIX_CATEGORIE;
  indexManche = 0;
  indexQuestion: number = 0;
  manches$: Observable<Question[][]> = of([]);

  currentQuestion: Question | null = null;
  otherQuestion: Question | null = null;

  mortSubiteActivated: boolean = false;
  questionMortSubite: Question | null = null;

  equipeEnJeu: string = '';

  musiques = ['niveau1', 'niveau2', 'niveau2', 'niveau3', 'niveau3', 'niveau4', 'mortSubite'];

  channel = new BroadcastChannel('reponse-admin');

  constructor(
    private partieStore: PartieStore,
    private partieOrchestrator: PartieOrchestrator,
    private equipeStore: EquipesStore,
  ) {}

  ngOnInit(): void {
    this.etatPartie =
      getEtapePartieFromString(localStorage.getItem(EtatPartieKeys.ETAPE_PARTIE) || '') ||
      EtatPartie.CHOIX_CATEGORIE;
    this.manches$ = this.partieStore.getPartie().pipe(
      map((partie) => {
        this.questionMortSubite = partie.questionMortSubite;
        return partie.listeQuestions.reduce((acc, currentQuestion, i) => {
          if (i % 2 === 0) {
            acc.push([currentQuestion, partie.listeQuestions[i + 1]]);
          }
          return acc;
        }, [] as Question[][]);
      }),
      tap((manches) => {
        const savedIndexManche = localStorage.getItem(EtatPartieKeys.INDEX_CURRENT_MANCHE);
        const savedIndexQuestion = localStorage.getItem(EtatPartieKeys.INDEX_CURRENT_QUESTION);
        if (savedIndexManche && savedIndexQuestion) {
          this.indexManche = Number.parseInt(savedIndexManche);
          this.indexQuestion = Number.parseInt(savedIndexQuestion);
          this.currentQuestion = manches[this.indexManche][this.indexQuestion];
        }
      }),
    );
    this.equipeStore.equipeEnJeu$
      .pipe(
        tap((equipeEnJeu) => {
          this.equipeEnJeu = equipeEnJeu;
        }),
      )
      .subscribe();
    this.partieOrchestrator.etatPartie$
      .pipe(
        tap((etat) => {
          this.etatPartie = etat;
          switch (this.etatPartie) {
            case EtatPartie.QUESTION_2:
              this.equipeStore.changerEquipeEnJeu();
              if (this.indexManche === 6) {
                this.partieOrchestrator.resetQuestionMortSubite();
              } else {
                this.showOtherQuestion();
              }
              break;
            case EtatPartie.CHOIX_CATEGORIE:
              this.indexManche++;
              localStorage.setItem(
                EtatPartieKeys.INDEX_CURRENT_MANCHE,
                this.indexManche.toString(),
              );
              if (this.indexManche === 6) {
                this.showQuestionMortSubite();
                this.partieOrchestrator.passerEtatSuivant();
              }
              break;
            default:
          }
        }),
      )
      .subscribe();
  }

  showSelectedQuestion(manches: Question[][], indexQuestion: any) {
    this.indexQuestion = indexQuestion;
    this.currentQuestion = manches[this.indexManche][indexQuestion];
    this.channel.postMessage(this.currentQuestion);
    this.otherQuestion = manches[this.indexManche][1 - indexQuestion];
    this.partieOrchestrator.passerEtatSuivant();
    localStorage.setItem(EtatPartieKeys.INDEX_CURRENT_QUESTION, this.indexQuestion.toString());
  }

  showOtherQuestion() {
    this.currentQuestion = this.otherQuestion;
    this.channel.postMessage(this.currentQuestion);
    localStorage.setItem(
      EtatPartieKeys.INDEX_CURRENT_QUESTION,
      (1 - this.indexQuestion).toString(),
    );
  }

  showQuestionMortSubite() {
    this.mortSubiteActivated = true;
    this.currentQuestion = this.questionMortSubite;
    this.channel.postMessage(this.currentQuestion);
    this.otherQuestion = this.questionMortSubite;
  }
}
