import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule, NativeScriptRouterModule } from '@nativescript/angular';
import { EpubReaderComponent } from './epub-reader.component';

@NgModule({
  imports: [NativeScriptCommonModule, NativeScriptRouterModule.forChild([{ path: '', component: EpubReaderComponent }])],
  declarations: [EpubReaderComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class EpubReaderModule {}
