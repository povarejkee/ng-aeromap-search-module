import { Component, OnInit } from '@angular/core';

import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private TranslateService: TranslateService) {}

  ngOnInit(): void {
    this.TranslateService.setDefaultLang('ru')
  }

  switchLanguage(lang: 'ru' | 'en'): void {
    this.TranslateService.setDefaultLang(lang)
  }
}
