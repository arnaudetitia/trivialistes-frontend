import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { QuestionComponent } from '../question/question.component';
import { Question } from '../../../models/partie.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reponses.component',
  imports: [CommonModule, QuestionComponent],
  templateUrl: './reponses-admin.component.html',
  styleUrl: './reponses-admin.component.scss',
})
export class ReponsesAdminComponent implements OnInit {
  channel = new BroadcastChannel('reponse-admin');

  currentQuestion: Question | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.channel.onmessage = (message) => {
      this.currentQuestion = message.data;
      this.cdr.detectChanges();
    };
  }
}
