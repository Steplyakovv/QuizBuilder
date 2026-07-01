import { createId } from '../utils/id';
import { Option } from './quiz.models';

export function addOption(options: Option[]): Option[] {
  return [...options, { id: createId(), label: '' }];
}

export function removeOption(options: Option[], optionId: string): Option[] {
  return options.filter((option) => option.id !== optionId);
}

export function updateOptionLabel(options: Option[], optionId: string, label: string): Option[] {
  return options.map((option) => (option.id === optionId ? { ...option, label } : option));
}

export function updateOptionImageUrl(
  options: Option[],
  optionId: string,
  imageUrl: string,
): Option[] {
  return options.map((option) =>
    option.id === optionId ? { ...option, imageUrl: imageUrl || undefined } : option,
  );
}

export function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((existing) => existing !== id) : [...ids, id];
}
