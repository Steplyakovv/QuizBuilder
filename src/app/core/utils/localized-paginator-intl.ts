import { inject } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslocoService } from '@jsverse/transloco';

export function localizedPaginatorIntl(): MatPaginatorIntl {
  const transloco = inject(TranslocoService);
  const intl = new MatPaginatorIntl();

  const apply = (): void => {
    intl.itemsPerPageLabel = transloco.translate('paginator.itemsPerPage');
    intl.nextPageLabel = transloco.translate('paginator.nextPage');
    intl.previousPageLabel = transloco.translate('paginator.previousPage');
    intl.firstPageLabel = transloco.translate('paginator.firstPage');
    intl.lastPageLabel = transloco.translate('paginator.lastPage');
    intl.getRangeLabel = (page: number, pageSize: number, length: number): string => {
      if (length === 0 || pageSize === 0) {
        return transloco.translate('paginator.rangeEmpty', { length });
      }
      const start = page * pageSize + 1;
      const end = Math.min(start + pageSize - 1, length);
      return transloco.translate('paginator.range', { start, end, length });
    };
    intl.changes.next();
  };

  apply();
  transloco.langChanges$.subscribe(apply);

  return intl;
}
