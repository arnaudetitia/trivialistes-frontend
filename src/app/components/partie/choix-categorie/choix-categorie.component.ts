import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Host,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { Question } from '../../../models/partie.model';
import { CodeTouches } from '../../../models/code-touches.enum';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'choix-categorie',
  imports: [CommonModule],
  templateUrl: './choix-categorie.component.html',
  styleUrl: './choix-categorie.component.scss',
})
export class ChoixCategorieComponent {
  @Input() manche: Question[] = [];

  @Output() onCategorieSelected = new EventEmitter<number>();

  showCategories = false;

  jouerQuestion(index: number) {
    this.onCategorieSelected.emit(index);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyEvent($event: KeyboardEvent) {
    switch ($event.code) {
      case CodeTouches.spacebarCode:
        this.showCategories = true;
    }

    $event.stopPropagation();
  }
}
