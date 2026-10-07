import { afterEach, describe, expect, it } from 'vitest';
import { publicPath } from '../src/utils/publicPath.js';

describe('publicPath', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
  });

  it('leaves local paths rooted at /', () => {
    expect(publicPath('/assets/logo.jpg')).toBe('/assets/logo.jpg');
    expect(publicPath('assets/logo.jpg')).toBe('/assets/logo.jpg');
  });

  it('prefixes the GitHub Pages base path', () => {
    process.env.NEXT_PUBLIC_BASE_PATH = '/Gods-Of-The-Realms-War-of-Worlds';
    expect(publicPath('/assets/logo.jpg')).toBe(
      '/Gods-Of-The-Realms-War-of-Worlds/assets/logo.jpg',
    );
  });
});
