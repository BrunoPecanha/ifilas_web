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
    loadChildren: () => import('./features/store/pages/store.module').then(m => m.StoreModule)
  },
  // {
  //   path: 'queue/:id',
  //   loadChildren: () => import('./pages/queue-tracking/queue-tracking.module')
  //     .then(m => m.QueueTrackingPageModule)
  // },
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
