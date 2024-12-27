import { fakerPT_BR as faker } from '@faker-js/faker';
import { MockInstance } from 'vitest';

import { InvalidSecretKeyError } from '@/errors';
import { clearCookies } from '@/utils';
import { makeSut } from '@/utils/test-utils';

let cookieGetSpy: MockInstance;

let windowSpy: MockInstance;

const oldWindow: Window & typeof globalThis = { ...window };

describe('EncryptStorage: throw errors', () => {
  beforeAll(() => {
    cookieGetSpy = vitest.spyOn(document, 'cookie', 'get');
    windowSpy = vitest.spyOn(window, 'window', 'get');
    windowSpy = windowSpy?.mockImplementation(() => oldWindow);
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
    windowSpy?.mockClear();
    cookieGetSpy?.mockClear();
    windowSpy = windowSpy?.mockImplementation(() => oldWindow);
  });

  afterAll(() => {
    vitest.clearAllMocks();
    windowSpy?.mockClear();
    cookieGetSpy?.mockClear();
    windowSpy = windowSpy?.mockImplementation(() => oldWindow);
  });

  it('should throws InvalidSecretKeyError if secret key is invalid', () => {
    expect(() =>
      makeSut({ secretKey: faker.string.alphanumeric(8) }),
    ).toThrowError(InvalidSecretKeyError);
  });
});
