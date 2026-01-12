import { Component, NgZone } from '@angular/core';
import { DemoSharedEpubReader } from '@demo/shared';
import {} from '@kakha13/epub-reader';

@Component({
  selector: 'demo-epub-reader',
  templateUrl: 'epub-reader.component.html',
})
export class EpubReaderComponent {
  demoShared: DemoSharedEpubReader;

  constructor(private _ngZone: NgZone) {}

  ngOnInit() {
    this.demoShared = new DemoSharedEpubReader();
  }
}
