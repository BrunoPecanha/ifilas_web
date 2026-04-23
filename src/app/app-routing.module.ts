import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'store',
    pathMatch: 'full'
  },
  {
    path: 'store',
    loadChildren: () => import('./pages/store/store.module').then(m => m.StoreModule)
  },
  {
     path: 'service/:id',
     loadChildren: () => import('./pages/service/service.module').then(m => m.ServiceModule)       
   },
  // {
  //   path: 'schedule/:id',
  //   loadChildren: () => import('./pages/schedule-booking/schedule-booking.module')
  //     .then(m => m.ScheduleBookingPageModule)
  // }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
