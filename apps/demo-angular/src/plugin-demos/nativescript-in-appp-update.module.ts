import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule, NativeScriptRouterModule } from '@nativescript/angular';
import { NativescriptInApppUpdateComponent } from './nativescript-in-appp-update.component';

@NgModule({
  imports: [NativeScriptCommonModule, NativeScriptRouterModule.forChild([{ path: '', component: NativescriptInApppUpdateComponent }])],
  declarations: [NativescriptInApppUpdateComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class NativescriptInApppUpdateModule {}
