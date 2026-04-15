import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { StorePageRoutingModule } from './store-routing.module';

import { StorePage } from './store.page';
import { StoreDesktopComponent } from '../ui/desktop/store-desktop.component';
import { StoreMobileComponent } from '../ui/mobile/store-mobile.component';
import { AttendantSelectionMobileComponent } from '../ui/mobile/components/attendant-selection-mobile/attendant-selection-mobile.component';
import { AttendantCardMobileComponent } from '../ui/mobile/components/attendant-card-mobile/attendant-card-mobile.component';

@NgModule({
  declarations: [
    StorePage,
    StoreMobileComponent,
    StoreDesktopComponent,

    AttendantSelectionMobileComponent,
    AttendantCardMobileComponent,
    // ServiceSelectionMobileComponent,
    // PaymentSelectionMobileComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StorePageRoutingModule
  ]
})
export class StoreModule { }