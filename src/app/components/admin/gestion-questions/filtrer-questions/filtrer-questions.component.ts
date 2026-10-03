import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { FiltreType } from '../../../../models/filtre-type.enum';
import { MatInputModule } from '@angular/material/input';
import { CategorieService } from '../../../../services/categorie.service';
import {
  Categorie,
  Partie,
  PartieDescription,
  QuestionDesc,
} from '../../../../models/partie.model';
import { combineLatest, take, tap } from 'rxjs';
import { PartieService } from '../../../../services/partie.service';

@Component({
  selector: 'filtrer-questions',
  imports: [MatSelectModule, MatOptionModule, MatInputModule],
  templateUrl: './filtrer-questions.component.html',
  styleUrl: './filtrer-questions.component.scss',
})
export class FiltrerQuestionsComponent implements OnInit, OnChanges {
  @Input() modeMortSubite = false;

  FiltreType = FiltreType;
  FiltreTypeLabels = Object.values(FiltreType).filter(
    (value) => typeof value === 'string',
  ) as string[];

  currentFiltreType = signal<FiltreType | null>(null);

  categorieList = signal<Categorie[]>([]);
  partieList = signal<PartieDescription[]>([]);

  @Output() onFiltreValueChange = new EventEmitter<{
    typeFiltre: FiltreType;
    value: string | number | PartieDescription;
  }>();

  constructor(
    private categorieService: CategorieService,
    private partieService: PartieService,
  ) {}

  ngOnInit() {
    combineLatest([this.categorieService.getAllCategories(), this.partieService.getAllParties()])
      .pipe(
        take(1),
        tap(([categories, parties]) => {
          this.categorieList.set(categories);
          this.partieList.set(parties);
        }),
      )
      .subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['modeMortSubite']?.currentValue &&
      this.currentFiltreType() === FiltreType.CATEGORIE
    ) {
      this.currentFiltreType.set(null);
    }
  }

  registerFilterType(value: string) {
    this.currentFiltreType.set(FiltreType[value as keyof typeof FiltreType]);
  }

  onFilterValueChange(value: number | PartieDescription | string) {
    switch (this.currentFiltreType()) {
      case FiltreType.CATEGORIE:
        this.onFiltreValueChange.emit({
          typeFiltre: FiltreType.CATEGORIE,
          value: value as number,
        });
        break;
      case FiltreType.PARTIE:
        this.onFiltreValueChange.emit({
          typeFiltre: FiltreType.PARTIE,
          value: value as PartieDescription,
        });
        break;
      case FiltreType.TEXTE:
        this.onFiltreValueChange.emit({
          typeFiltre: FiltreType.TEXTE,
          value: value as string,
        });
        break;
    }
  }
}
