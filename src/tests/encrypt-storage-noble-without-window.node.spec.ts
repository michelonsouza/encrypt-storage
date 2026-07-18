import { fakerPT_BR as faker } from '@faker-js/faker';

import { EncryptStorageNoble } from '@/classes';
import { IsNotBrowserEnvironmentError } from '@/errors';

describe('EncryptStorageNoble without window 🖥️', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should not throws IsNotBrowserEnvironmentError if the current environment is not a browser environment when instance class', () => {
    expect(
      () =>
        new EncryptStorageNoble(faker.string.alphanumeric(10), {
          engine: 'noble',
        }),
    ).not.toThrow(IsNotBrowserEnvironmentError);
  });

  it('should throws IsNotBrowserEnvironmentError if the current environment is not a browser environment when use methods', () => {
    const sut = new EncryptStorageNoble(faker.string.alphanumeric(10), {
      engine: 'noble',
    });
    const key = faker.string.alphanumeric(5);
    const value = faker.word.words(2);

    expect(() => sut.setItem(key, value)).toThrow(IsNotBrowserEnvironmentError);
  });
});
