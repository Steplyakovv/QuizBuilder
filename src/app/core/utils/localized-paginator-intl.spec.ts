import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import { provideTestTransloco } from '../testing/provide-test-transloco';
import { localizedPaginatorIntl } from './localized-paginator-intl';

describe('localizedPaginatorIntl', () => {
  async function create() {
    TestBed.configureTestingModule({ providers: [provideTestTransloco()] });
    const transloco = TestBed.inject(TranslocoService);
    await firstValueFrom(transloco.load(transloco.getActiveLang()));
    return TestBed.runInInjectionContext(() => localizedPaginatorIntl());
  }

  it('translates the static labels', async () => {
    const intl = await create();
    expect(intl.itemsPerPageLabel).toBe('Показывать по:');
    expect(intl.nextPageLabel).toBe('Следующая страница');
    expect(intl.previousPageLabel).toBe('Предыдущая страница');
  });

  it('formats the range label for a full page', async () => {
    const intl = await create();
    expect(intl.getRangeLabel(0, 10, 12)).toBe('1 – 10 из 12');
    expect(intl.getRangeLabel(1, 10, 12)).toBe('11 – 12 из 12');
  });

  it('formats the range label when there are no items', async () => {
    const intl = await create();
    expect(intl.getRangeLabel(0, 10, 0)).toBe('0 из 0');
  });
});
