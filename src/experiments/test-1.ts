/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */
import 'jest-localstorage-mock';
import faker from 'faker';

import { EncryptStorage } from '..';
import { EncryptStorageOptions } from '../types';

import { InvalidSecretKeyError } from '../errors';

interface makeSutParams extends EncryptStorageOptions {
  secretKey?: string;
  noOptions?: boolean;
}

export const makeSut = (
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

export const test1 = () =>
  describe('EncryptStorage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should enshure localStorage been called', () => {
      const safeStorage = makeSut();
      const key = faker.random.word();

      safeStorage.setItem(key, faker.random.word());

      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should enshure sessionStorage been called', () => {
      const safeStorage = makeSut({ storageType: 'sessionStorage' });
      const key = faker.random.word();

      safeStorage.setItem(key, faker.random.word());

      expect(sessionStorage.setItem).toHaveBeenCalled();
    });

    it('should calls localStorage.getItem with correct key', () => {
      const safeStorage = makeSut();
      const key = faker.random.word();

      safeStorage.getItem(key);

      expect(localStorage.getItem).toHaveBeenCalledWith(key);
    });

    it('should localStorage.getItem returns correct decrypted value', () => {
      const safeStorage = makeSut();
      const key = faker.random.word();
      const value = { value: faker.random.word() };

      safeStorage.setItem(key, value);
      const storagedDecrypetdValue = safeStorage.getItem(key);

      expect(storagedDecrypetdValue).toEqual(value);
    });

    it('should localStorage.getItem returns correct value but not decrypt', () => {
      const safeStorage = makeSut();
      const key = faker.random.word();
      const value = { value: faker.random.word() };

      safeStorage.setItem(key, value, true);
      const storagedDecrypetdValue = safeStorage.getItem(key, true);

      expect(storagedDecrypetdValue).toEqual(value);
    });

    it('should localStorage.getItem returns correct decrypted value when is a string', () => {
      const safeStorage = makeSut();
      const key = faker.random.word();
      const value = faker.random.word();

      safeStorage.setItem(key, value);
      const storagedDecrypetdValue = safeStorage.getItem(key);

      expect(storagedDecrypetdValue).toEqual(value);
    });

    it('should calls localStorage.removeItem with correct key', () => {
      const safeStorage = makeSut();
      const key = faker.random.word();

      safeStorage.removeItem(key);

      expect(localStorage.removeItem).toHaveBeenCalledWith(key);
    });

    it('should calls localStorage.removeItem with correct prefix and key', () => {
      const prefix = faker.random.word();
      const safeStorage = makeSut({ prefix });
      const key = faker.random.word();
      const composedKey = `${prefix}:${key}`;

      safeStorage.removeItem(key);

      expect(localStorage.removeItem).toHaveBeenCalledWith(composedKey);
    });

    it('should calls localStorage.getItem for all items with this pattern', () => {
      const safeStorage = makeSut();
      const pattern = faker.random.alphaNumeric(8);
      const userKey = `${pattern}:user`;
      const itemKey = `${pattern}:item`;

      const mockedValue = {
        [userKey]: { id: faker.datatype.number(1000) },
        [itemKey]: { id: faker.datatype.number(1000) },
      };

      safeStorage.setItem(userKey, mockedValue[userKey]);
      safeStorage.setItem(itemKey, mockedValue[itemKey]);

      const storagedValue = safeStorage.getItemFromPattern(pattern);

      expect(localStorage.getItem).toHaveBeenCalledWith(userKey);
      expect(localStorage.getItem).toHaveBeenCalledWith(itemKey);
      expect(storagedValue).toEqual(mockedValue);
    });

    it('should calls localStorage.getItem for all items with this pattern and remove prefix key', () => {
      const prefix = faker.random.word();
      const safeStorage = makeSut({
        prefix,
      });
      const pattern = faker.random.alphaNumeric(8);
      const userKey = `${pattern}:user`;
      const itemKey = `${pattern}:item`;

      const mockedValue = {
        [userKey]: { id: faker.datatype.number(1000) },
        [itemKey]: { id: faker.datatype.number(1000) },
      };

      safeStorage.setItem(userKey, mockedValue[userKey]);
      safeStorage.setItem(itemKey, mockedValue[itemKey]);

      const storagedValue = safeStorage.getItemFromPattern(pattern);

      expect(localStorage.getItem).toHaveBeenCalledWith(`${prefix}:${userKey}`);
      expect(localStorage.getItem).toHaveBeenCalledWith(`${prefix}:${itemKey}`);
      expect(storagedValue).toEqual(mockedValue);
    });

    it('should calls localStorage.getItem for item with this exact pattern', () => {
      const safeStorage = makeSut();
      const userKey = 'user';
      const itemKey = 'item';

      const mockedValue = {
        [userKey]: { id: faker.datatype.number(1000) },
        [itemKey]: { id: faker.datatype.number(1000) },
      };

      safeStorage.setItem(userKey, mockedValue[userKey]);
      safeStorage.setItem(itemKey, mockedValue[itemKey]);

      const storagedValue = safeStorage.getItemFromPattern(itemKey, {
        exact: true,
        multiple: false,
      });

      const notHaveValue = safeStorage.getItemFromPattern(
        faker.datatype.uuid(),
        {
          exact: true,
          multiple: false,
        },
      );

      expect(localStorage.getItem).toHaveBeenCalledWith(itemKey);
      expect(notHaveValue).toBe(undefined);
      expect(storagedValue).toEqual(mockedValue[itemKey]);
    });
    it('should calls localStorage.getItem for item with this pattern and prefix no multiple', () => {
      const pattern = faker.random.word();
      const prefix = faker.random.word();
      const safeStorage = makeSut({
        prefix,
      });
      const userKey = `${pattern}:user`;
      const itemKey = `${pattern}:item`;

      const mockedValue = {
        [userKey]: { id: faker.datatype.number(1000) },
        [itemKey]: { id: faker.datatype.number(1000) },
      };

      safeStorage.setItem(userKey, mockedValue[userKey]);
      safeStorage.setItem(itemKey, mockedValue[itemKey]);

      const storagedValue = safeStorage.getItemFromPattern(itemKey, {
        multiple: false,
      });

      const notHaveValue = safeStorage.getItemFromPattern(
        faker.datatype.uuid(),
        {
          multiple: false,
        },
      );

      expect(localStorage.getItem).toHaveBeenCalledWith(`${prefix}:${itemKey}`);
      expect(notHaveValue).toBe(undefined);
      expect(storagedValue).toEqual(mockedValue[itemKey]);
    });

    it('should calls localStorage.getItem with getItemFromPattern returns undefined', () => {
      const safeStorage = makeSut();
      const pattern = faker.random.alphaNumeric(8);

      const storagedValue = safeStorage.getItemFromPattern(pattern);

      expect(storagedValue).toEqual(undefined);
    });

    it('should calls localStorage.removeItem for all items with this pattern', () => {
      const safeStorage = makeSut();
      const pattern = faker.random.alphaNumeric(8);
      const userKey = `${pattern}:user`;
      const itemKey = `${pattern}:item`;

      safeStorage.setItem(userKey, { id: 123 });
      safeStorage.setItem(itemKey, { id: 456 });

      safeStorage.removeItemFromPattern(pattern);

      expect(localStorage.removeItem).toHaveBeenCalledWith(userKey);
      expect(localStorage.removeItem).toHaveBeenCalledWith(itemKey);
    });

    it('should calls localStorage.removeItem for all items with this pattern and prefix', () => {
      const prefix = faker.random.word();
      const safeStorage = makeSut({
        prefix,
      });
      const pattern = faker.random.alphaNumeric(8);
      const userKey = `${pattern}:user`;
      const itemKey = `${pattern}:item`;

      safeStorage.setItem(userKey, { id: 123 });
      safeStorage.setItem(itemKey, { id: 456 });

      safeStorage.removeItemFromPattern(pattern);

      expect(localStorage.removeItem).toHaveBeenCalledWith(
        `${prefix}:${userKey}`,
      );
      expect(localStorage.removeItem).toHaveBeenCalledWith(
        `${prefix}:${itemKey}`,
      );
    });

    it('should calls localStorage.removeItem for all items with this exact pattern', () => {
      const safeStorage = makeSut();
      const userKey = 'user';
      const itemKey = 'item';

      safeStorage.setItem(userKey, { id: 123 });
      safeStorage.setItem(itemKey, { id: 456 });

      safeStorage.removeItemFromPattern(itemKey, { exact: true });

      expect(localStorage.removeItem).toHaveBeenCalledWith(itemKey);
    });

    it('should calls localStorage.clear', () => {
      const safeStorage = makeSut();
      const key1 = faker.random.word();
      const key2 = faker.random.word();
      const anyValue = faker.random.word();

      safeStorage.setItem(key1, anyValue);
      safeStorage.setItem(key2, anyValue);

      expect(localStorage.length).toBe(2);
      expect(safeStorage.length).toBe(2);

      safeStorage.clear();

      expect(localStorage.length).toBe(0);
      expect(safeStorage.length).toBe(0);
    });

    it('should get correct key insted of index', () => {
      const safeStorage = makeSut();
      const key1 = faker.random.word();
      const key2 = faker.random.word();

      safeStorage.setItem(key1, 'any_value');
      safeStorage.setItem(key2, 'any_value');

      expect(safeStorage.key(0)).toBe(key1);
      expect(safeStorage.key(1)).toBe(key2);
      expect(safeStorage.key(2)).toBeFalsy();
    });

    it('should return string if stateManagementUse is true', () => {
      const safeStorage = makeSut({ stateManagementUse: true });
      const key = faker.random.word();

      safeStorage.setItem(key, { value: faker.random.word(), number: 100 });
      const value = safeStorage.getItem(key);

      expect(typeof value).toBe('string');
    });

    it('should return undefined when key not exists', () => {
      const safeStorage = makeSut();

      expect(safeStorage.getItem('unknow_key')).toBe(undefined);
    });

    it('should use prefix with key', () => {
      const prefix = '@test';
      const key = faker.random.word();
      const safeStorage = makeSut({ prefix });

      safeStorage.setItem(key, { value: faker.random.word(), number: 100 });
      safeStorage.getItem(key);

      expect(localStorage.getItem).toHaveBeenCalledWith(`${prefix}:${key}`);
    });

    it('should throws InvalidSecretKeyError if secret key is invalid', () => {
      try {
        makeSut({ secretKey: faker.random.alphaNumeric(8) });
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidSecretKeyError);
      }
    });

    it('should encrypt string and return encrypted value', () => {
      const safeStorage = makeSut();
      const value = faker.random.word();
      const result = safeStorage.encryptString(value);

      expect(result).not.toEqual(value);
    });

    it('should encrypt value and return encrypted value', () => {
      const safeStorage = makeSut();
      const value = {
        name: faker.random.word(),
        id: faker.datatype.uuid(),
      };
      const result = safeStorage.encryptValue(value);

      expect(result).not.toEqual(value);
    });

    it('should decrypt string and return decrypted value', () => {
      const safeStorage = makeSut();
      const value = faker.random.word();
      const encryptedValue = safeStorage.encryptString(value);
      const decryptedValue = safeStorage.decryptString(encryptedValue);

      expect(decryptedValue).toEqual(value);
    });

    it('should decrypt value and return decrypted value', () => {
      const safeStorage = makeSut();
      const value = {
        name: faker.random.word(),
        id: faker.datatype.uuid(),
      };
      const encryptedValue = safeStorage.encryptValue(value);
      const decryptedValue =
        safeStorage.decryptValue<typeof value>(encryptedValue);

      expect(decryptedValue).toEqual(value);
    });

    it('should test encryptStorage without options', () => {
      const safeStorage = makeSut({ noOptions: true });
      const key = faker.random.word();

      safeStorage.getItem(key);

      expect(localStorage.getItem).toHaveBeenCalledWith(key);
    });

    it('should test Rabbit algorithm', () => {
      const safeStorage = makeSut({ encAlgorithm: 'Rabbit' });
      const key = faker.random.word();
      const value = faker.random.word();

      safeStorage.setItem(key, value);
      safeStorage.getItem(key);

      expect(localStorage.setItem).toHaveBeenCalled();
      expect(localStorage.getItem).toHaveBeenCalledWith(key);
    });

    it('should test RC4 algorithm', () => {
      const safeStorage = makeSut({ encAlgorithm: 'RC4' });
      const key = faker.random.word();
      const value = faker.random.word();

      safeStorage.setItem(key, value);
      safeStorage.getItem(key);

      expect(localStorage.setItem).toHaveBeenCalled();
      expect(localStorage.getItem).toHaveBeenCalledWith(key);
    });

    it('should test RC4Drop algorithm', () => {
      const safeStorage = makeSut({ encAlgorithm: 'RC4Drop' });
      const key = faker.random.word();
      const value = faker.random.word();

      safeStorage.setItem(key, value);
      safeStorage.getItem(key);

      expect(localStorage.setItem).toHaveBeenCalled();
      expect(localStorage.getItem).toHaveBeenCalledWith(key);
    });

    it('should throws InvalidSecretKeyError if secret key is invalid', () => {
      try {
        makeSut({ secretKey: faker.random.alphaNumeric(8) });
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidSecretKeyError);
      }
    });
  });
