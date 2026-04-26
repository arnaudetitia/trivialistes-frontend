export enum EtatPartie {
  CHOIX_CATEGORIE = 'CHOIX_CATEGORIE',
  QUESTION_1 = 'QUESTION_1',
  QUESTION_2 = 'QUESTION_2',
  SCORES = 'SCORES',
}

export const getEtapePartieFromString = (value: string): EtatPartie | undefined => {
  // On vérifie si la string fait partie des valeurs de l'Enum
  if (Object.values(EtatPartie).includes(value as EtatPartie)) {
    return value as EtatPartie;
  }
  return undefined; // Ou une valeur par défaut
};
