import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DeviceService {

  isMobile(): boolean {
    return true //window.innerWidth < 768;
  }

  isDesktop(): boolean {
    return !this.isMobile();
  }
}