import { describe, it, expect } from 'vitest';
import { isConversionSupported } from '../converters';

describe('converters', () => {
  it('isConversionSupported returns true for png->jpg', () => {
    expect(isConversionSupported('png', 'jpg')).toBe(true);
  });

  it('exports convertFile as a function', () => {
    // Import relatively to avoid path mapping complexity
    const converters = require('../converters');
    expect(typeof converters.convertFile).toBe('function');
  });
});
