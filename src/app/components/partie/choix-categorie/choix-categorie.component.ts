import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Host,
  HostListener,
  Input,
  Output,
  signal,
} from '@angular/core';
import { Question } from '../../../models/partie.model';
import { CodeTouches } from '../../../models/code-touches.enum';

@Component({
  selector: 'choix-categorie',
  imports: [],
  templateUrl: './choix-categorie.component.html',
  styleUrl: './choix-categorie.component.scss',
})
export class ChoixCategorieComponent {
  @Input() manche: Question[] = [];

  @Output() onCategorieSelected = new EventEmitter<number>();

  showCategories = signal<boolean>(false);

  jouerQuestion(index: number) {
    this.onCategorieSelected.emit(index);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyEvent($event: KeyboardEvent) {
    switch ($event.code) {
      case CodeTouches.spacebarCode:
        this.showCategories.set(true);
    }

    $event.stopPropagation();
  }
}
