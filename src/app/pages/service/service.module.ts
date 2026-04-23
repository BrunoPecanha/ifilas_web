import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ServicePage } from './service.page';
import { ServicePageRoutingModule } from './service-routing.module';
import { ServiceDesktopComponent } from 'src/app/features/services/ui/desktop/service-desktop.component';
import { ServiceMobileComponent } from 'src/app/features/services/ui/mobile/service-mobile.component';
import { CustomFooterComponent } from 'src/app/shared/custom-footer/custom-footer.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    ServicePage,
    ServiceDesktopComponent,
    ServiceMobileComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ServicePageRoutingModule,
    SharedModule
  ]
})
export class ServiceModule { }