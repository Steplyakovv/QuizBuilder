import { MatPaginatorIntl } from '@angular/material/paginator';

export function ruPaginatorIntl(): MatPaginatorIntl {
  const intl = new MatPaginatorIntl();
  intl.itemsPerPageLabel = 'Показывать по:';
  intl.nextPageLabel = 'Следующая страница';
  intl.previousPageLabel = 'Предыдущая страница';
  intl.firstPageLabel = 'Первая страница';
  intl.lastPageLabel = 'Последняя страница';
  intl.getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return `0 из ${length}`;
    }
    const start = page * pageSize + 1;
    const end = Math.min(start + pageSize - 1, length);
    return `${start} – ${end} из ${length}`;
  };
  return intl;
}
