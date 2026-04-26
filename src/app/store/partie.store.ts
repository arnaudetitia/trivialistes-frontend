import { Injectable } from '@angular/core';
import { PartieService } from '../services/partie.service';
import { Observable } from 'rxjs';
import { Partie } from '../models/partie.model';
import { EtatPartieKeys } from '../models/etat-partie-keys.enum';

@Injectable({ providedIn: 'root' })
export class PartieStore {
  constructor(private partieService: PartieService) {}
  idPartie: number = 0;

  setIdPartie(id: number) {
    this.idPartie = id;
    localStorage.setItem(EtatPartieKeys.PARTIE, this.idPartie.toString());
  }

  getPartie(): Observable<Partie> {
    if (!this.idPartie) {
      this.setIdPartie(Number.parseInt(localStorage.getItem(EtatPartieKeys.PARTIE) || '0'));
    }
    return this.partieService.getPartieById(this.idPartie);
  }
}
