import { Component, inject, output } from '@angular/core';
import { DEFAULT_PAGINATION, Pagination } from '../../util/pagination';
import { LoadingService } from '../../../core/services/loading/loading.service';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss',
})
export class PaginatorComponent {
  readonly loadingService = inject(LoadingService);

  protected onPageChange = output<Pagination>();

  protected _pagination: Pagination = { ...DEFAULT_PAGINATION };

  protected hasMoreItems: boolean = true;
  protected hasLessItems: boolean = false;

  nextPage() {
    this._pagination.currentPage++;
    this.onPageChange.emit(this._pagination);
  }

  previousPage() {
    this._pagination.currentPage--;
    this.onPageChange.emit(this._pagination);
  }

  updateState({ hasMoreItems, hasLessItems }: UpdatePaginationState) {
    if (hasMoreItems !== undefined) {
      this.hasMoreItems = hasMoreItems;
      if (!this.hasMoreItems) {
        this._pagination.currentPage--;
      }
    }
    if (hasLessItems !== undefined) {
      this.hasLessItems = hasLessItems;
    }
  }

  get pagination() {
    return { ...this._pagination };
  }

  get pageSize() {
    return this._pagination.pageSize;
  }

  get currentPage() {
    return this._pagination.currentPage;
  }
}

type UpdatePaginationState = {
  hasMoreItems?: boolean;
  hasLessItems?: boolean;
};
