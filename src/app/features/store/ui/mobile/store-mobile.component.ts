// store-mobile.component.ts
import { Component } from '@angular/core';


@Component({
  selector: 'app-store-mobile',
  templateUrl: './store-mobile.component.html',
  styleUrls: ['./store-mobile.component.scss'],
  standalone: false
})
export class StoreMobileComponent {
  step: 'attendant' | 'service' | 'payment' = 'attendant';

  goToServices() {
    this.step = 'service';
  }

  goToPayment() {
    this.step = 'payment';
  }
}