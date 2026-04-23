import { Component, HostListener } from '@angular/core';
import { DeviceService } from 'src/app/core/services/device';

@Component({
  selector: 'app-service',
  templateUrl: './service.page.html',
  styleUrls: ['./service.page.scss'],
  standalone: false
})
export class ServicePage {

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