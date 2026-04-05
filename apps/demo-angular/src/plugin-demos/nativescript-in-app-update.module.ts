import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule, NativeScriptRouterModule } from '@nativescript/angular';
import { NativescriptInAppUpdateComponent } from './nativescript-in-app-update.component';

@NgModule({
  imports: [NativeScriptCommonModule, NativeScriptRouterModule.forChild([{ path: '', component: NativescriptInAppUpdateComponent }])],
  declarations: [NativescriptInAppUpdateComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class NativescriptInAppUpdateModule {}
