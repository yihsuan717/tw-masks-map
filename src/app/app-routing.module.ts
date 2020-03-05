import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: 'pharmacies',
    loadChildren: () => import('./main/main.module').then(m => m.MainModule)
  },
  {
    path: '**',
    redirectTo: 'pharmacies'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
