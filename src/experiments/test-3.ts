/**
 * @jest-environment node
 */
import 'jest-localstorage-mock';
import { fakerPT_BR as faker } from '@faker-js/faker';

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
    secretKey = faker.string.alphanumeric(10),
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

function getWindow(): (Window & typeof globalThis) | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window;
}

let safeWindow = getWindow();

export const test3 = () =>
  describe('EncryptStprage without window', () => {
    beforeEach(() => {
      safeWindow = getWindow();
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should enshure localStorage not been called', () => {
      const safeStorage = makeSut();
      const key = faker.string.alphanumeric(5);

      safeStorage.setItem(key, faker.word.sample());

      expect(safeWindow?.localStorage?.setItem).toBe(undefined);
    });

    it('should enshure sessionStorage not been called', () => {
      const safeStorage = makeSut({ storageType: 'sessionStorage' });
      const key = faker.string.alphanumeric(5);

      safeStorage.setItem(key, faker.word.sample());

      expect(safeWindow?.sessionStorage?.setItem).toBe(undefined);
    });

    it('should calls localStorage.getItem not been called', () => {
      const safeStorage = makeSut();
      const key = faker.string.alphanumeric(5);

      safeStorage.getItem(key);

      expect(safeWindow?.localStorage?.getItem).toBe(undefined);
    });

    it('should calls localStorage.removeItem not been called', () => {
      const safeStorage = makeSut();
      const key = faker.string.alphanumeric(5);

      safeStorage.removeItem(key);

      expect(safeWindow?.localStorage?.removeItem).toBe(undefined);
    });

    it('should calls localStorage.getItem not been called when safeStorage.getItemFromPattern is called', () => {
      const safeStorage = makeSut();
      const pattern = faker.string.alphanumeric(8);
      const userKey = `${pattern}:user`;
      const itemKey = `${pattern}:item`;

      const mockedValue = {
        [userKey]: { id: faker.number.int({ min: 1, max: 1000 }) },
        [itemKey]: { id: faker.number.int({ min: 1, max: 1000 }) },
      };

      safeStorage.setItem(userKey, mockedValue[userKey]);
      safeStorage.setItem(itemKey, mockedValue[itemKey]);

      safeStorage.getItemFromPattern(pattern);

      expect(safeWindow?.localStorage?.getItem).toBe(undefined);
    });

    it('should calls localStorage.length not been called', () => {
      const safeStorage = makeSut();
      const key1 = faker.word.sample();
      const key2 = faker.word.sample();
      const anyValue = faker.word.sample();

      safeStorage.setItem(key1, anyValue);
      safeStorage.setItem(key2, anyValue);
      let safeStorageLength = safeStorage.length;

      safeStorage.clear();

      safeStorageLength = safeStorage.length;

      expect(safeWindow?.localStorage?.length).toBe(undefined);
      expect(safeStorageLength).toBe(0);
    });

    it('should calls localStorage.removeItem not been called when safeStorage.removeItemFromPattern is called', () => {
      const safeStorage = makeSut();
      const pattern = faker.string.alphanumeric(8);
      const userKey = `${pattern}:user`;
      const itemKey = `${pattern}:item`;

      safeStorage.setItem(userKey, { id: 123 });
      safeStorage.setItem(itemKey, { id: 456 });

      safeStorage.removeItemFromPattern(pattern);

      expect(safeWindow?.localStorage?.removeItem).toBe(undefined);
    });

    it('should calls localStorage.removeItem is undefined whensafeStorage.removeItemFromPattern is called', () => {
      const safeStorage = makeSut();
      const pattern = faker.string.alphanumeric(8);
      const userKey = `${pattern}:user`;
      const itemKey = `${pattern}:item`;

      safeStorage.setItem(userKey, { id: 123 });
      safeStorage.setItem(itemKey, { id: 456 });

      safeStorage.removeItemFromPattern(pattern);

      expect(safeWindow?.localStorage?.getItem).toBe(undefined);
    });

    it('should localStorage.key is undefined', () => {
      const safeStorage = makeSut();
      const key1 = faker.word.sample();
      const key2 = faker.word.sample();

      safeStorage.setItem(key1, 'any_value');
      safeStorage.setItem(key2, 'any_value');

      expect(safeStorage.key(0)).toBe(null);
      expect(safeStorage.key(1)).toBe(null);
      expect(safeStorage.key(2)).toBeFalsy();
    });
  });
