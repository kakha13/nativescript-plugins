import { Observable, EventData, Page } from '@nativescript/core';
import { DemoSharedNativescriptInApppUpdate } from '@demo/shared';
import {} from '@kakha13/nativescript-in-appp-update';

export function navigatingTo(args: EventData) {
  const page = <Page>args.object;
  page.bindingContext = new DemoModel();
}

export class DemoModel extends DemoSharedNativescriptInApppUpdate {}
