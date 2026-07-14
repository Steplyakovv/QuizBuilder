import ru from '../../../../public/i18n/ru.json';

function getByPath(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, source);
}

/**
 * Framework-free stand-in for TranslocoService.translate() in unit tests of plain functions
 * (quiz-attempt.ts, quiz-scoring.ts) that take a `translate` callback instead of injecting the
 * service. Reads the real ru.json - the single source of truth - so tests never hand-duplicate
 * translated strings that could drift from it.
 */
export function testTranslate(key: string, params?: Record<string, unknown>): string {
  const template = getByPath(ru, key);
  if (typeof template !== 'string') {
    return key;
  }
  if (!params) {
    return template;
  }
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match, name: string) =>
    String(params[name] ?? ''),
  );
}
