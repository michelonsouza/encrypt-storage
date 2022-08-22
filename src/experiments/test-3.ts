/**
 * @jest-environment node
 */

/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */
import 'jest-localstorage-mock';
import faker from 'faker';

import { EncryptStorage } from '..';
import { EncryptStorageOptions } from '../types';

interface makeSutParams extends EncryptStorageOptions {
  secretKey?: string;
  noOptions?: boolean;
}

const makeSut = (
  params: makeSutParams = {} as makeSutParams,
): EncryptStorage => {
  const {
    prefix,
    storageType,
    stateManagementUse,
    noOptions,
    encAlgorithm,
    secretKey = faker.random.alphaNumeric(10),
  } = params;
  const options = noOptions
    ? undefined
    : {
        prefix,
        storageType,
        stateManagementUse,
        encAlgorithm,
      };
  return new EncryptStorage(secretKey, options);
};

let windowSpy: jest.SpyInstance<(Window & typeof globalThis) | undefined>;

export const test3 = () =>
  describe('EncryptStprage without window', () => {
    beforeAll(() => {
      windowSpy = jest.spyOn(window, 'window', 'get');
      windowSpy?.mockImplementation(() => undefined);
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should enshure localStorage not been called', () => {
      const safeStorage = makeSut();
      const key = faker.random.word();

      windowSpy?.mockImplementation(() => undefined);
      safeStorage.setItem(key, faker.random.word());

      expect(localStorage?.setItem).toHaveBeenCalledTimes(0);
    });

    it('should enshure sessionStorage not been called', () => {
      windowSpy?.mockImplementation(() => undefined);
      const safeStorage = makeSut({ storageType: 'sessionStorage' });
      const key = faker.random.word();

      windowSpy?.mockImplementation(() => undefined);
      safeStorage.setItem(key, faker.random.word());

      expect(sessionStorage?.setItem).toHaveBeenCalledTimes(0);
    });

    it('should calls localStorage.getItem not been called', () => {
      const safeStorage = makeSut();
      const key = faker.random.word();

      windowSpy?.mockImplementation(() => undefined);
      safeStorage.getItem(key);

      expect(localStorage?.getItem).toHaveBeenCalledTimes(0);
    });

    it('should calls localStorage.removeItem not been called', () => {
      const safeStorage = makeSut();
      const key = faker.random.word();

      windowSpy?.mockImplementation(() => undefined);
      safeStorage.removeItem(key);

      expect(localStorage?.removeItem).toHaveBeenCalledTimes(0);
    });

    it('should calls localStorage.getItem not been called when safeStorage.getItemFromPattern is called', () => {
      const safeStorage = makeSut();
      const pattern = faker.random.alphaNumeric(8);
      const userKey = `${pattern}:user`;
      const itemKey = `${pattern}:item`;

      const mockedValue = {
        [userKey]: { id: faker.datatype.number(1000) },
        [itemKey]: { id: faker.datatype.number(1000) },
      };

      windowSpy?.mockImplementation(() => undefined);
      safeStorage.setItem(userKey, mockedValue[userKey]);
      safeStorage.setItem(itemKey, mockedValue[itemKey]);

      safeStorage.getItemFromPattern(pattern);

      expect(localStorage?.getItem).toHaveBeenCalledTimes(0);
    });

    it('should calls localStorage.length not been called', () => {
      windowSpy?.mockImplementation(() => undefined);
      const safeStorage = makeSut();
      const key1 = faker.random.word();
      const key2 = faker.random.word();
      const anyValue = faker.random.word();

      safeStorage.setItem(key1, anyValue);
      safeStorage.setItem(key2, anyValue);
      let safeStorageLength = safeStorage.length;

      safeStorage.clear();

      safeStorageLength = safeStorage.length;

      expect(window?.localStorage?.length).toBeUndefined();
      expect(safeStorageLength).toBe(0);
    });

    it('should calls localStorage.removeItem not been called when safeStorage.removeItemFromPattern is called', () => {
      windowSpy?.mockImplementation(() => undefined);
      const safeStorage = makeSut();
      const pattern = faker.random.alphaNumeric(8);
      const userKey = `${pattern}:user`;
      const itemKey = `${pattern}:item`;

      safeStorage.setItem(userKey, { id: 123 });
      safeStorage.setItem(itemKey, { id: 456 });

      safeStorage.removeItemFromPattern(pattern);

      expect(localStorage?.removeItem).toHaveBeenCalledTimes(0);
    });

    it('should calls localStorage.removeItem is undefined whensafeStorage.removeItemFromPattern is called', () => {
      windowSpy?.mockImplementation(() => undefined);
      const safeStorage = makeSut();
      const pattern = faker.random.alphaNumeric(8);
      const userKey = `${pattern}:user`;
      const itemKey = `${pattern}:item`;

      safeStorage.setItem(userKey, { id: 123 });
      safeStorage.setItem(itemKey, { id: 456 });

      safeStorage.removeItemFromPattern(pattern);

      expect(window?.localStorage?.getItem).toBeUndefined();
    });

    it('should localStorage.key is undefined', () => {
      const safeStorage = makeSut();
      const key1 = faker.random.word();
      const key2 = faker.random.word();

      safeStorage.setItem(key1, 'any_value');
      safeStorage.setItem(key2, 'any_value');

      expect(safeStorage.key(0)).toBe(null);
      expect(safeStorage.key(1)).toBe(null);
      expect(safeStorage.key(2)).toBeFalsy();
    });
  });
