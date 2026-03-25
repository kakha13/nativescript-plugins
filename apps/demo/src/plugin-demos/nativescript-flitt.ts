import { Observable, EventData, Page } from '@nativescript/core';
import { DemoSharedNativescriptFlitt } from '@demo/shared';
import {} from '@kakha13/nativescript-flitt';

export function navigatingTo(args: EventData) {
  const page = <Page>args.object;
  page.bindingContext = new DemoModel();
}

export class DemoModel extends DemoSharedNativescriptFlitt {}
