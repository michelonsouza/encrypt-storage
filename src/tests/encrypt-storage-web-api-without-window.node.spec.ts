import { fakerPT_BR as faker } from '@faker-js/faker';

import { EncryptStorageWebApi } from '@/classes';
import { IsNotBrowserEnvironmentError } from '@/errors';

describe('EncryptStorageWebApi without window 🖥️', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should not throws IsNotBrowserEnvironmentError if the current environment is not a browser environment when instance class', () => {
    expect(
      () =>
        new EncryptStorageWebApi(faker.string.alphanumeric(10), {
          engine: 'web-crypto',
        }),
    ).not.toThrow(IsNotBrowserEnvironmentError);
  });

  it('should throws IsNotBrowserEnvironmentError if the current environment is not a browser environment when use methods', async () => {
    const sut = new EncryptStorageWebApi(faker.string.alphanumeric(10), {
      engine: 'web-crypto',
    });
    const key = faker.string.alphanumeric(5);
    const value = faker.word.words(2);

    await expect(sut.setItem(key, value)).rejects.toThrow(
      IsNotBrowserEnvironmentError,
    );
  });
});
