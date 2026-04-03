import { Component, NgZone } from '@angular/core';
import { DemoSharedNativescriptInApppUpdate } from '@demo/shared';
import {} from '@kakha13/nativescript-in-appp-update';

@Component({
  selector: 'demo-nativescript-in-appp-update',
  templateUrl: 'nativescript-in-appp-update.component.html',
})
export class NativescriptInApppUpdateComponent {
  demoShared: DemoSharedNativescriptInApppUpdate;

  constructor(private _ngZone: NgZone) {}

  ngOnInit() {
    this.demoShared = new DemoSharedNativescriptInApppUpdate();
  }
}
