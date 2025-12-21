import { describe, it, expect } from 'vitest';
import { isConversionSupported } from '../converters';

describe('converters', () => {
  it('isConversionSupported returns true for png->jpg', () => {
    expect(isConversionSupported('png', 'jpg')).toBe(true);
  });

  it('exports convertFile as a function', () => {
    // Import using ES module syntax
    import('../converters').then(converters => {
      expect(typeof converters.convertFile).toBe('function');
    });
  });
});
