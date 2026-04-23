import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-custom-footer',
  templateUrl: './custom-footer.component.html',
  styleUrls: ['./custom-footer.component.scss'],
  standalone: false
})
export class CustomFooterComponent implements OnInit {

  platform: 'android' | 'ios' | 'web' = 'web';

  constructor() {
    this.detectPlatform();
  }

  ngOnInit() { }

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
