import { fakerPT_BR as faker } from '@faker-js/faker';
import { MockInstance } from 'vitest';

import { clearCookies } from '@/utils';
import { makeSut } from '@/utils/test-utils';

let cookieSetSpy: MockInstance;
let cookieGetSpy: MockInstance;

describe('EncryptStorage: storage types', () => {
  beforeAll(() => {
    beforeAll(() => {
      /* c8 ignore next 4 */
      cookieSetSpy = vitest.spyOn(document, 'cookie', 'set');
      cookieSetSpy?.mockImplementation(() => undefined);
      cookieGetSpy = vitest.spyOn(document, 'cookie', 'get');
      cookieGetSpy?.mockImplementation(() => undefined);
    });
  });

  beforeEach(() => {
    clearCookies();
    localStorage.clear();
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  afterEach(() => {
    vitest.clearAllMocks();
  });

  it('should enshure localStorage been called', () => {
    const encryptStorage = makeSut();
    const key = faker.word.words(1);

    encryptStorage.setItem(key, faker.word.words(1));

    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should enshure sessionStorage been called', () => {
    const encryptStorage = makeSut({ storageType: 'sessionStorage' });
    const key = faker.word.words(1);

    encryptStorage.setItem(key, faker.word.words(1));

    expect(sessionStorage.setItem).toHaveBeenCalled();
  });

  it('should enshure cookies been called', () => {
    const encryptStorage = makeSut({ storageType: 'cookies' });
    const key = faker.word.words(1);
    const domain = faker.internet.domainName();
    const expires = faker.date.future({
      years: 0.2,
      refDate: Date.now(),
    });

    encryptStorage.setItem(key, faker.word.words(1), {
      domain,
      expires,
    });

    expect(document.cookie).toContain(key);
    expect(document.cookie).toContain(expires.toUTCString());
  });
});
