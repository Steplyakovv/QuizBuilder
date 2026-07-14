import { EnvironmentProviders } from '@angular/core';
import { provideTransloco, Translation, TranslocoLoader } from '@jsverse/transloco';
import { Observable, of } from 'rxjs';
import ru from '../../../../public/i18n/ru.json';

/**
 * Feeds the real ru.json (the source-of-truth translations, kept byte-identical to what used
 * to be hardcoded in templates) straight into TestBed - no HTTP loader, no duplicated fixture
 * translations to keep in sync by hand. Uses an Observable (of()) rather than a Promise: a
 * resolved Promise still takes a microtask to settle, which is enough for a test that calls
 * TranslocoService.translate() synchronously right after TestBed.inject() (no component, no
 * fixture.whenStable() to wait it out) to see the translation as not-yet-loaded. of() emits
 * synchronously on subscribe, so the translation is available immediately.
 */
class InlineTestTranslocoLoader implements TranslocoLoader {
  getTranslation(): Observable<Translation> {
    return of(ru as Translation);
  }
}

export function provideTestTransloco(): EnvironmentProviders[] {
  return provideTransloco({
    config: {
      availableLangs: ['ru'],
      defaultLang: 'ru',
      reRenderOnLangChange: false,
      prodMode: true,
    },
    loader: InlineTestTranslocoLoader,
  });
}
