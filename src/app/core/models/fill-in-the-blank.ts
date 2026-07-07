const BLANK_MARKER = '{{}}';

export function splitTemplate(template: string): string[] {
  return template.split(BLANK_MARKER);
}

export function countBlanks(template: string): number {
  return splitTemplate(template).length - 1;
}
