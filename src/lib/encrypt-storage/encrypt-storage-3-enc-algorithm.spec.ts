import { fakerPT_BR as faker } from '@faker-js/faker';
import { MockInstance } from 'vitest';

import { clearCookies } from '@/utils';
import { makeSut } from '@/utils/test-utils';

let cookieSetSpy: MockInstance;
let cookieGetSpy: MockInstance;

describe('EncryptStorage: encrypt algorithm', () => {
  beforeAll(() => {
    cookieSetSpy = vitest.spyOn(document, 'cookie', 'set');
    cookieSetSpy?.mockImplementation(() => undefined);
    cookieGetSpy = vitest.spyOn(document, 'cookie', 'get');
    cookieGetSpy?.mockImplementation(() => undefined);
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

  it('should test Rabbit algorithm', () => {
    const encryptStorage = makeSut({ encAlgorithm: 'Rabbit' });
    const key = faker.word.words(1);
    const value = faker.word.words(1);

    encryptStorage.setItem(key, value);
    encryptStorage.getItem(key);

    expect(localStorage.setItem).toHaveBeenCalled();
    expect(localStorage.getItem).toHaveBeenCalledWith(key);
  });

  it('should test RC4 algorithm', () => {
    const encryptStorage = makeSut({ encAlgorithm: 'RC4' });
    const key = faker.word.words(1);
    const value = faker.word.words(1);

    encryptStorage.setItem(key, value);
    encryptStorage.getItem(key);

    expect(localStorage.setItem).toHaveBeenCalled();
    expect(localStorage.getItem).toHaveBeenCalledWith(key);
  });

  it('should test RC4Drop algorithm', () => {
    const encryptStorage = makeSut({ encAlgorithm: 'RC4Drop' });
    const key = faker.word.words(1);
    const value = faker.word.words(1);

    encryptStorage.setItem(key, value);
    encryptStorage.getItem(key);

    expect(localStorage.setItem).toHaveBeenCalled();
    expect(localStorage.getItem).toHaveBeenCalledWith(key);
  });

  it('should be hash any string to SHA256 encrypted string', () => {
    const encryptStorage = makeSut();
    const value = faker.word.words(3);

    const result = encryptStorage.hash(value);

    expect(result).not.toEqual(value);
  });

  it('should be hash any string to MD5 encrypted string', () => {
    const encryptStorage = makeSut();
    const value = faker.word.words(3);

    const result = encryptStorage.md5Hash(value);

    expect(result).not.toEqual(value);
  });
});
