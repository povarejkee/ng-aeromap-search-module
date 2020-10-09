import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { MapTranslateLoader } from './translate-loader';

import { TranslateLoader, TranslateModule, TranslateStore } from '@ngx-translate/core';
import { SearchModule } from './modules/search/search.module';

import { AppComponent } from './app.component';

import { JwtInterceptor } from '../common/jwt.interceptor';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SearchModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: MapTranslateLoader,
      },
      isolate: true,
      useDefaultLang: true,
    }),
  ],
  providers: [
    TranslateStore,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
