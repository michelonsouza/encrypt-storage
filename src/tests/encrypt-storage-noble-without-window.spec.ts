/**
 * @vitest-environment node
 */
import 'vitest-localstorage-mock';
import { fakerPT_BR as faker } from '@faker-js/faker';

import { EncryptStorageNoble } from '@/classes';
import { IsNotBrowserEnvironmentError } from '@/errors';

describe('EncryptStorageNoble without window 🖥️', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throws IsNotBrowserEnvironmentError if the current environment is not a browser environment', () => {
    try {
      new EncryptStorageNoble(faker.string.alphanumeric(10), {
        engine: 'noble',
      });
    } catch (error) {
      expect(error).toBeInstanceOf(IsNotBrowserEnvironmentError);
    }
  });
});
