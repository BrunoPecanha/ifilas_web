// shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { CustomFooterComponent } from './custom-footer/custom-footer.component';
import { CustomHeaderComponent } from './custom-header/custom-header/custom-header.component';

@NgModule({
  declarations: [
    CustomFooterComponent,
    CustomHeaderComponent
  ],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [
    CustomFooterComponent,
    CustomHeaderComponent
  ]
})
export class SharedModule {}