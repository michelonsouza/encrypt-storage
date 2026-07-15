/**
 * @jest-environment node
 */

import { fakerPT_BR as faker } from '@faker-js/faker';

import { EncryptStorage } from '..';
import {
  CookieOptions,
  EncryptStorageOptions,
  NotifyHandlerParams,
} from '../types';

interface makeSutParams extends EncryptStorageOptions {
  secretKey?: string;
  noOptions?: boolean;
}

const mockNotify = {
  mockedFn: jest.fn().mockImplementation((params: NotifyHandlerParams) => {
    return params;
  }),
};

const makeSut = (
  params: makeSutParams = {} as makeSutParams,
): EncryptStorage => {
  const {
    prefix,
    storageType,
    stateManagementUse,
    noOptions,
    encAlgorithm,
    doNotParseValues = false,
    notifyHandler = mockNotify.mockedFn,
    secretKey = faker.string.alphanumeric(10),
  } = params;
  const options = noOptions
    ? undefined
    : {
        prefix,
        storageType,
        stateManagementUse,
        encAlgorithm,
        notifyHandler,
        doNotParseValues,
      };
  return new EncryptStorage(secretKey, options);
};

let cookieSetSpy: jest.SpyInstance;
let cookieGetSpy: jest.SpyInstance;

export const test4 = () =>
  describe('EncryptStprage cookie', () => {
    beforeAll(() => {
      cookieSetSpy = jest.spyOn(document, 'cookie', 'set');
      cookieSetSpy?.mockImplementation(() => undefined);
      cookieGetSpy = jest.spyOn(document, 'cookie', 'get');
      cookieGetSpy?.mockImplementation(() => undefined);
    });

    beforeEach(() => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: '',
      });
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should enshure cookie.set not been called', () => {
      const safeStorage = makeSut();
      const key = faker.word.sample();
      const value = { value: faker.word.sample() };

      (document.cookie as any) = undefined;

      safeStorage.cookie.set(key, value);
      expect(document.cookie).toEqual(undefined);
    });

    it('should enshure cookie.get not been called', () => {
      const safeStorage = makeSut();
      const key = faker.word.sample();
      const value = { value: faker.word.sample() };

      safeStorage.cookie.set(key, value);

      (document.cookie as any) = undefined;

      safeStorage.cookie.get(key);

      expect(document.cookie).toEqual(undefined);
    });

    it('should enshure cookie.remove not been called when document.cookie is undefined', () => {
      const safeStorage = makeSut();
      const key = faker.word.sample();
      const value = { value: faker.word.sample() };

      safeStorage.cookie.set(key, value);

      (document.cookie as any) = undefined;

      safeStorage.cookie.remove(key);

      expect(document.cookie).toEqual(undefined);
    });

    it('should enshure cookie.remove been called', () => {
      const safeStorage = makeSut();
      const key = faker.word.sample();
      const value = { value: faker.word.sample() };
      const spy = jest.spyOn(mockNotify, 'mockedFn');

      safeStorage.cookie.set(key, value);
      safeStorage.cookie.remove(key);
      const result = safeStorage.cookie.get(key);

      expect(result).toEqual('');
      expect(spy).toHaveBeenCalledWith({
        value: undefined,
        key,
        type: 'remove:cookie',
      });
    });

    it('should enshure cookie.set been called with correct key and params', () => {
      const safeStorage = makeSut();
      const key = faker.string.alphanumeric(10);
      const value = faker.word.sample();
      const spy = jest.spyOn(mockNotify, 'mockedFn');
      const date = faker.date.future({ years: 1 });
      const domain = faker.internet.domainName();
      const path = '/';
      const sameSite = faker.helpers.arrayElement<CookieOptions['sameSite']>([
        'strict',
        'lax',
        'none',
      ]);

      const params = {
        expires: date,
        path,
        domain,
        secure: true,
        sameSite,
      };

      safeStorage.cookie.set(key, value, params);

      expect(document.cookie).toContain(key);
      expect(document.cookie).toContain(`path=${path}`);
      expect(document.cookie).toContain(`expires=${date.toUTCString()}`);
      expect(document.cookie).toContain(`secure`);
      expect(document.cookie).toContain(`domain=${domain}`);
      expect(document.cookie).toContain(`samesite=${sameSite}`);
      expect(spy).toHaveBeenCalledWith({
        value: undefined,
        key,
        type: 'set:cookie',
      });
    });

    it('should enshure cookie.set been called with expires in number', () => {
      const safeStorage = makeSut({
        doNotParseValues: true,
      });
      const key = faker.string.alphanumeric(10);
      const value = faker.word.sample();
      const spy = jest.spyOn(mockNotify, 'mockedFn');
      const date = faker.number.int(50);
      const domain = faker.internet.domainName();

      const params = {
        expires: date,
        domain,
      };

      safeStorage.cookie.set(key, value, params);
      safeStorage.cookie.get(key);

      expect(document.cookie).toContain(key);
      expect(spy).toHaveBeenCalledWith({
        value: undefined,
        key,
        type: 'set:cookie',
      });
    });

    it('should calls cookie with correct key', () => {
      const safeStorage = makeSut();
      const key = faker.word.sample();
      const value = faker.word.sample();
      safeStorage.cookie.set(key, value);

      const spy = jest.spyOn(mockNotify, 'mockedFn');

      safeStorage.cookie.get<string>(key);

      expect(document.cookie).toContain(key);
      expect(spy).toHaveBeenCalledWith({
        value: undefined,
        key,
        type: 'get:cookie',
      });
    });

    it('should cookie.get returns correct decrypted value', () => {
      const safeStorage = makeSut();
      const key = faker.word.sample();
      const value = { value: faker.word.sample() };

      safeStorage.cookie.set(key, value);
      const storagedDecrypetdValue = safeStorage.cookie.get(key);

      expect(storagedDecrypetdValue).toEqual(value);
    });

    it('should cookie.get returns null', () => {
      const safeStorage = makeSut();
      const key = faker.word.sample();

      const result = safeStorage.cookie.get(key);

      expect(result).toEqual(null);
    });
  });
