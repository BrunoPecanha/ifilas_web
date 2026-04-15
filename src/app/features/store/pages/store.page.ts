import { Component, HostListener } from '@angular/core';
import { DeviceService } from 'src/app/core/services/device';

@Component({
  selector: 'app-store',
  templateUrl: './store.page.html',
  styleUrls: ['./store.page.scss'],
  standalone: false
})
export class StorePage {

  isMobile = false;

  constructor(private device: DeviceService) {
    this.checkDevice();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkDevice();
  }

  ionViewWillEnter() {
    this.checkDevice();
  }

  private checkDevice() {
    this.isMobile = this.device.isMobile();
  }

}