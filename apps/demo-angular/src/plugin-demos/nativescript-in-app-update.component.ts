import { Component, NgZone } from '@angular/core';
import { DemoSharedNativescriptInAppUpdate } from '@demo/shared';
import {} from '@kakha13/nativescript-in-app-update';

@Component({
  selector: 'demo-nativescript-in-app-update',
  templateUrl: 'nativescript-in-app-update.component.html',
})
export class NativescriptInAppUpdateComponent {
  demoShared: DemoSharedNativescriptInAppUpdate;

  constructor(private _ngZone: NgZone) {}

  ngOnInit() {
    this.demoShared = new DemoSharedNativescriptInAppUpdate();
  }
}
