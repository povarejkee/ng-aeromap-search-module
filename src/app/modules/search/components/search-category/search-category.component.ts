import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-search-category',
  templateUrl: './search-category.component.html',
  styleUrls: ['./search-category.component.scss']
})
export class SearchCategoryComponent {
  @Input() items: any
  @Input() label: string

  trackByFn(index: number, item: any): string {
    return `${item.type}-${item.id}`
  }
}
