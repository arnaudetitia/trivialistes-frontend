import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionComponent } from './question/question.component';
import { ChoixCategorieComponent } from './choix-categorie/choix-categorie.component';
import { PartieStore } from '../../store/partie.store';
import { Question } from '../../models/partie.model';
import { Observable, of, tap } from 'rxjs';
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
  etatPartie = signal<EtatPartie>(EtatPartie.CHOIX_CATEGORIE);
  indexManche = signal<number>(0);
  indexQuestion = signal<number>(0);
  manches = signal<Question[][]>([]);

  //currentQuestion: Question | null = null;
  currentQuestion = computed(() => {
    if (this.mortSubiteActivated) {
      return this.questionMortSubite;
    }
    const manche = this.manches()[this.indexManche()];
    return manche ? manche[this.indexQuestion()] : null;
  });
  otherQuestion = computed(() => {
    if (this.mortSubiteActivated) {
      return this.questionMortSubite;
    }
    const manche = this.manches()[this.indexManche()];
    return manche ? manche[1 - this.indexQuestion()] : null;
  });

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
    this.etatPartie.set(
      getEtapePartieFromString(localStorage.getItem(EtatPartieKeys.ETAPE_PARTIE) || '') ||
        EtatPartie.CHOIX_CATEGORIE,
    );
    this.partieStore
      .getPartie()
      .pipe(
        tap((partie) => {
          this.questionMortSubite = partie.questionMortSubite;
          this.manches.set(
            partie.listeQuestions.reduce((acc, currentQuestion, i) => {
              if (i % 2 === 0) {
                acc.push([currentQuestion, partie.listeQuestions[i + 1]]);
              }
              return acc;
            }, [] as Question[][]),
          );
          const savedIndexManche = localStorage.getItem(EtatPartieKeys.INDEX_CURRENT_MANCHE);
          const savedIndexQuestion = localStorage.getItem(EtatPartieKeys.INDEX_CURRENT_QUESTION);
          if (savedIndexManche && savedIndexQuestion) {
            this.indexManche.set(Number.parseInt(savedIndexManche));
            this.indexQuestion.set(Number.parseInt(savedIndexQuestion));
          }
        }),
      )
      .subscribe();
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
          this.etatPartie.set(etat);
          switch (this.etatPartie()) {
            case EtatPartie.QUESTION_2:
              this.equipeStore.changerEquipeEnJeu();
              if (this.indexManche() === this.manches().length) {
                this.partieOrchestrator.resetQuestionMortSubite();
              } else {
                this.showOtherQuestion();
              }
              break;
            case EtatPartie.CHOIX_CATEGORIE:
              this.indexManche.set(this.indexManche() + 1);
              localStorage.setItem(
                EtatPartieKeys.INDEX_CURRENT_MANCHE,
                this.indexManche.toString(),
              );
              if (this.indexManche() === this.manches().length) {
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

  showSelectedQuestion(indexQuestion: any) {
    this.indexQuestion.set(indexQuestion);
    this.channel.postMessage(this.currentQuestion());
    this.partieOrchestrator.passerEtatSuivant();
    localStorage.setItem(EtatPartieKeys.INDEX_CURRENT_QUESTION, this.indexQuestion().toString());
  }

  showOtherQuestion() {
    this.indexQuestion.set(1 - this.indexQuestion());
    this.channel.postMessage(this.currentQuestion());
    localStorage.setItem(
      EtatPartieKeys.INDEX_CURRENT_QUESTION,
      (1 - this.indexQuestion()).toString(),
    );
  }

  showQuestionMortSubite() {
    this.mortSubiteActivated = true;
    this.channel.postMessage(this.currentQuestion());
  }
}
