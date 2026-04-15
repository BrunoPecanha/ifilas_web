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
  platform: 'android' | 'ios' | 'web' = 'web';

  constructor(private device: DeviceService) {
    this.checkDevice();
     this.detectPlatform();
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

  detectPlatform() {
    const userAgent = navigator.userAgent || navigator.vendor;

    if (/android/i.test(userAgent)) {
      this.platform = 'android';
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
      this.platform = 'ios';
    } else {
      this.platform = 'web';
    }
  }

  redirectToStore() {
    if (this.platform === 'android') {
      window.open('https://play.google.com/store/apps/details?id=IFILAS', '_system');
    } else if (this.platform === 'ios') {
      window.open('https://apps.apple.com/app/idIFILAS', '_system');
    }
  }

  


}