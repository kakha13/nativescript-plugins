import { Observable, EventData, Page } from '@nativescript/core';
import { DemoSharedNativescriptInAppUpdate } from '@demo/shared';
import {} from '@kakha13/nativescript-in-app-update';

export function navigatingTo(args: EventData) {
  const page = <Page>args.object;
  page.bindingContext = new DemoModel();
}

export class DemoModel extends DemoSharedNativescriptInAppUpdate {}
