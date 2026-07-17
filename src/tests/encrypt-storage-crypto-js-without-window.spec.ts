/**
 * @vitest-environment node
 */
import 'vitest-localstorage-mock';
import { fakerPT_BR as faker } from '@faker-js/faker';

import { EncryptStorageCryptoJs } from '@/classes';
import { IsNotBrowserEnvironmentError } from '@/errors';

describe('EncryptStorageCryptoJs without window 🖥️', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throws IsNotBrowserEnvironmentError if the current environment is not a browser environment', () => {
    try {
      new EncryptStorageCryptoJs(faker.string.alphanumeric(10), {
        engine: 'crypto-js',
      });
    } catch (error) {
      expect(error).toBeInstanceOf(IsNotBrowserEnvironmentError);
    }
  });
});
