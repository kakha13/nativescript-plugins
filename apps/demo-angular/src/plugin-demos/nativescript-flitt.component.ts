import { Component, NgZone } from '@angular/core';
import { DemoSharedNativescriptFlitt } from '@demo/shared';
import {} from '@kakha13/nativescript-flitt';

@Component({
  selector: 'demo-nativescript-flitt',
  templateUrl: 'nativescript-flitt.component.html',
})
export class NativescriptFlittComponent {
  demoShared: DemoSharedNativescriptFlitt;

  constructor(private _ngZone: NgZone) {}

  ngOnInit() {
    this.demoShared = new DemoSharedNativescriptFlitt();
  }
}
