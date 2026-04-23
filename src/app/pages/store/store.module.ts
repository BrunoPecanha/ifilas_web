import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { StorePageRoutingModule } from './store-routing.module';

import { StoreDesktopComponent } from '../../features/store/ui/desktop/store-desktop.component';
import { StoreMobileComponent } from '../../features/store/ui/mobile/store-mobile.component';
import { AttendantCardMobileComponent } from '../../features/store/ui/mobile/components/attendant-card-mobile/attendant-card-mobile.component';
import { StorePage } from './store.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    StorePage,
    StoreMobileComponent,
    StoreDesktopComponent,
    AttendantCardMobileComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StorePageRoutingModule,
    SharedModule
  ]
})
export class StoreModule { }