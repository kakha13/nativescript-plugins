import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule, NativeScriptRouterModule } from '@nativescript/angular';
import { NativescriptFlittComponent } from './nativescript-flitt.component';

@NgModule({
  imports: [NativeScriptCommonModule, NativeScriptRouterModule.forChild([{ path: '', component: NativescriptFlittComponent }])],
  declarations: [NativescriptFlittComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class NativescriptFlittModule {}
