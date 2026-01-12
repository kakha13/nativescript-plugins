import { Observable, EventData, Page } from '@nativescript/core';
import { DemoSharedEpubReader } from '@demo/shared';
import {} from '@kakha13/epub-reader';

export function navigatingTo(args: EventData) {
  const page = <Page>args.object;
  page.bindingContext = new DemoModel();
}

export class DemoModel extends DemoSharedEpubReader {}
