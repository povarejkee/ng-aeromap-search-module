import { Observable, of } from 'rxjs';

import { TranslateLoader } from '@ngx-translate/core';

const RU = {
  Search: {
    All: 'Все',
    Objects: 'Объекты',
    Settlements: 'Нас. пункты',
    RestrictedAreas: 'Зоны',
    Highways: 'Трассы',
    Locations: 'Локации',
    NotFound: 'По вашему запросу ничего не найдено',
  },
};

const EN = {
  Search: {
    All: 'All',
    Objects: 'Objects',
    Settlements: 'Settlements',
    RestrictedAreas: 'Restricted Areas',
    Highways: 'Highways',
    Locations: 'Locations',
    NotFound: 'No results were found',
  },
};

export class MapTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    switch (lang) {
      case 'ru':
        return of(RU);
      case 'en':
      default:
        return of(EN);
    }
  }
}
