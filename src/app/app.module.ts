import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { PapaParseModule } from 'ngx-papaparse';
import { RecaptchaModule } from 'ng-recaptcha';

import { AppComponent } from './app.component';
import { FuseService } from './services/fuse';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    PapaParseModule,
    RecaptchaModule.forRoot()
  ],
  providers: [ FuseService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
