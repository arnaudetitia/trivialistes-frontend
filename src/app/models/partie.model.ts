export interface Partie {
  listeQuestions: Question[];
  questionMortSubite: Question;
}

export interface Question {
  id: number;
  idCategorie: number;
  categorie: string;
  question: string;
  reponses: string[];
}

export interface PartieDescription {
  id: number;
  nomPartie: string;
  listeQuestions: QuestionDesc[];
  questionMortSubite: string;
}

export interface PartieDTO {
  nomPartie: string;
  idQuestions: number[];
  idMortSubite: number;
}

export interface QuestionDesc {
  categorie: string;
  idQuestion: number;
  question: string;
}

export interface ResultatManche {
  numeroManche: number;
  scoreEquipeA: number;
  scoreEquipeB: number;
  equipeChoix: string;
  vainqueurManche: string;
  mortsubite: boolean;
}

export interface Categorie {
  id: number;
  libelleCategorie: string;
}
