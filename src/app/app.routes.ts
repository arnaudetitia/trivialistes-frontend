import { Routes } from '@angular/router';
import { HomepageComponent } from './components/homepage/homepage.component';
import { PartieComponent } from './components/partie/partie.component';
import { ReponsesAdminComponent } from './components/partie/reponses-admin/reponses-admin.component';
import { GestionPartiesComponent } from './components/admin/gestion-parties/gestion-parties.component';
import { GestionQuestionsComponent } from './components/admin/gestion-questions/gestion-questions.component';

export const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'partie', component: PartieComponent },
  { path: 'reponses', component: ReponsesAdminComponent },
  {
    path: 'admin',
    children: [
      { path: 'parties', component: GestionPartiesComponent },
      { path: 'questions', component: GestionQuestionsComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
