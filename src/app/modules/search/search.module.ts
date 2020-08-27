import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from "./material.module";

import { SearchContainerComponent } from './components/search-container/search-container.component';
import { SearchFieldComponent } from './components/search-field/search-field.component';
import { SearchResultsComponent } from './components/search-results/search-results.component';
import { SearchItemComponent } from "./components/search-item/search-item.component";
import { SearchFilterComponent } from "./components/search-filter/search-filter.component";
import { SearchCategoryComponent } from "./components/search-category/search-category.component";

import { SearchApi } from "./services/api.service";
import { SearchState } from "./services/state.service";
import { SearchFacade } from "./search-facade.service";
import { SearchCore } from "./services/core.service";

@NgModule({
  declarations: [
    SearchContainerComponent,
    SearchFieldComponent,
    SearchResultsComponent,
    SearchItemComponent,
    SearchFilterComponent,
    SearchCategoryComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    HttpClientModule,
    FormsModule,
    TranslateModule
  ],
  exports: [
    SearchContainerComponent,
  ],
  providers: [
    SearchApi,
    SearchState,
    SearchCore,
    SearchFacade,
  ]
})
export class SearchModule {}
