import { Component, Input } from '@angular/core'

@Component({
  selector: 'app-search-item',
  templateUrl: './search-item.component.html',
  styleUrls: ['./search-item.component.scss']
})
export class SearchItemComponent {
  @Input() public item: any

  /**
   * Получение index и itemsLength нужно для того,
   * чтобы узнать, какой из items последний. Это
   * даст возможность задать уникальный стиль последнему
   * элементу search-item, тк возникли сложности с селектором в css из-за обёртки,
   * в которую Ангуляр заворачивает компонент search-item
   * (нет возможности получить last-child). */
  @Input() public index: number
  @Input() public itemsLength: number
}
