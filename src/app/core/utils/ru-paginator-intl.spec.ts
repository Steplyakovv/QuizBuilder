import { ruPaginatorIntl } from './ru-paginator-intl';

describe('ruPaginatorIntl', () => {
  it('translates the static labels', () => {
    const intl = ruPaginatorIntl();
    expect(intl.itemsPerPageLabel).toBe('Показывать по:');
    expect(intl.nextPageLabel).toBe('Следующая страница');
    expect(intl.previousPageLabel).toBe('Предыдущая страница');
  });

  it('formats the range label for a full page', () => {
    const intl = ruPaginatorIntl();
    expect(intl.getRangeLabel(0, 10, 12)).toBe('1 – 10 из 12');
    expect(intl.getRangeLabel(1, 10, 12)).toBe('11 – 12 из 12');
  });

  it('formats the range label when there are no items', () => {
    const intl = ruPaginatorIntl();
    expect(intl.getRangeLabel(0, 10, 0)).toBe('0 из 0');
  });
});
