import { Component, OnInit, signal } from '@angular/core';
import { QuestionComponent } from '../question/question.component';
import { Question } from '../../../models/partie.model';

@Component({
  selector: 'app-reponses-admin',
  imports: [QuestionComponent],
  templateUrl: './reponses-admin.component.html',
  styleUrl: './reponses-admin.component.scss',
})
export class ReponsesAdminComponent implements OnInit {
  channel = new BroadcastChannel('reponse-admin');

  currentQuestion = signal<Question | null>(null);

  ngOnInit(): void {
    this.channel.onmessage = (message) => {
      this.currentQuestion.set(message.data);
    };
  }
}
