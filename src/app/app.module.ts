import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { PapaParseModule } from 'ngx-papaparse';

import { AppComponent } from './app.component';
import { FuseService } from './services/fuse';
import { XlsxToJsonService } from './services/xls';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    PapaParseModule
  ],
  providers: [ FuseService, XlsxToJsonService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
