import {
  addOption,
  removeOption,
  toggleId,
  updateOptionImageUrl,
  updateOptionLabel,
} from './question-options';

describe('addOption', () => {
  it('appends an option with an empty label and a unique id', () => {
    const options = addOption([]);
    expect(options).toHaveLength(1);
    expect(options[0].label).toBe('');
    expect(options[0].id).toBeTruthy();
  });
});

describe('removeOption', () => {
  it('removes the option with the given id', () => {
    const options = addOption(addOption([]));
    const [first] = options;

    const result = removeOption(options, first.id);

    expect(result).toHaveLength(1);
    expect(result.find((option) => option.id === first.id)).toBeUndefined();
  });
});

describe('updateOptionLabel', () => {
  it('updates only the matching option label', () => {
    const options = addOption(addOption([]));
    const [first, second] = options;

    const result = updateOptionLabel(options, first.id, 'Да');

    expect(result[0].label).toBe('Да');
    expect(result[1]).toEqual(second);
  });
});

describe('updateOptionImageUrl', () => {
  it('sets the image url on the matching option', () => {
    const options = addOption([]);

    const result = updateOptionImageUrl(options, options[0].id, 'https://example.com/a.png');

    expect(result[0].imageUrl).toBe('https://example.com/a.png');
  });

  it('clears the image url when given an empty string', () => {
    const options = addOption([]);
    const optionId = options[0].id;
    const withUrl = updateOptionImageUrl(options, optionId, 'https://example.com/a.png');

    const cleared = updateOptionImageUrl(withUrl, optionId, '');

    expect(cleared[0].imageUrl).toBeUndefined();
  });
});

describe('toggleId', () => {
  it('adds an id that is not present', () => {
    expect(toggleId(['a'], 'b')).toEqual(['a', 'b']);
  });

  it('removes an id that is already present', () => {
    expect(toggleId(['a', 'b'], 'a')).toEqual(['b']);
  });
});
