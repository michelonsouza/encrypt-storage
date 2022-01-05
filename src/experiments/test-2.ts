/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */
import 'jest-localstorage-mock';
import faker from 'faker';

import { EncryptStorageOptions, AsyncEncryptStorage } from '..';

import { InvalidSecretKeyError } from '../errors';

interface makeSutParams extends EncryptStorageOptions {
  secretKey?: string;
  noOptions?: boolean;
}

const makeSut = (
  params: makeSutParams = {} as makeSutParams,
): AsyncEncryptStorage => {
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
  return new AsyncEncryptStorage(secretKey, options);
};

export const test2 = () =>
  describe('AsyncEncryptStorage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should enshure localStorage been called', async () => {
      const safeStorage = makeSut();
      const key = faker.random.word();

      await safeStorage.setItem(key, faker.random.word());

      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should enshure sessionStorage been called', async () => {
      const safeStorage = makeSut({ storageType: 'sessionStorage' });
      const key = faker.random.word();

      await safeStorage.setItem(key, faker.random.word());

      expect(sessionStorage.setItem).toHaveBeenCalled();
    });

    it('should calls localStorage.getItem with correct key', async () => {
      const safeStorage = makeSut();
      const key = faker.random.word();

      await safeStorage.getItem(key);

      expect(localStorage.getItem).toHaveBeenCalledWith(key);
    });

    it('should localStorage.getItem returns correct decrypted value', async () => {
      const safeStorage = makeSut();
      const key = faker.random.word();
      const value = { value: faker.random.word() };

      await safeStorage.setItem(key, value);
      const storagedDecrypetdValue = await safeStorage.getItem(key);

      expect(storagedDecrypetdValue).toEqual(value);
    });

    it('should localStorage.getItem returns correct decrypted value when is a string', async () => {
      const safeStorage = makeSut();
      const key = faker.random.word();
      const value = faker.random.word();

      await safeStorage.setItem(key, value);
      const storagedDecrypetdValue = await safeStorage.getItem(key);

      expect(storagedDecrypetdValue).toEqual(value);
    });

    it('should calls localStorage.removeItem with correct key', async () => {
      const safeStorage = makeSut();
      const key = faker.random.word();

      await safeStorage.removeItem(key);

      expect(localStorage.removeItem).toHaveBeenCalledWith(key);
    });

    it('should calls localStorage.removeItem with correct prefix and key', async () => {
      const prefix = faker.random.word();
      const safeStorage = makeSut({ prefix });
      const key = faker.random.word();
      const composedKey = `${prefix}:${key}`;

      await safeStorage.removeItem(key);

      expect(localStorage.removeItem).toHaveBeenCalledWith(composedKey);
    });

    it('should calls localStorage.getItem for all items with this pattern', async () => {
      const safeStorage = makeSut();
      const pattern = faker.random.alphaNumeric(8);
      const userKey = `${pattern}:user`;
      const itemKey = `${pattern}:item`;

      const mockedValue = {
        [userKey]: { id: faker.datatype.number(1000) },
        [itemKey]: { id: faker.datatype.number(1000) },
      };

      await safeStorage.setItem(userKey, mockedValue[userKey]);
      await safeStorage.setItem(itemKey, mockedValue[itemKey]);

      const storagedValue = await safeStorage.getItemFromPattern(pattern);

      expect(localStorage.getItem).toHaveBeenCalledWith(userKey);
      expect(localStorage.getItem).toHaveBeenCalledWith(itemKey);
      expect(storagedValue).toEqual(mockedValue);
    });

    it('should calls localStorage.getItem with getItemFromPattern returns undefined', async () => {
      const safeStorage = makeSut();
      const pattern = faker.random.alphaNumeric(8);

      const storagedValue = await safeStorage.getItemFromPattern(pattern);

      expect(storagedValue).toEqual(undefined);
    });

    it('should calls localStorage.removeItem for all items with this pattern', async () => {
      const safeStorage = makeSut();
      const pattern = faker.random.alphaNumeric(8);
      const userKey = `${pattern}:user`;
      const itemKey = `${pattern}:item`;

      await safeStorage.setItem(userKey, { id: 123 });
      await safeStorage.setItem(itemKey, { id: 456 });

      await safeStorage.removeItemFromPattern(pattern);

      expect(localStorage.removeItem).toHaveBeenCalledWith(userKey);
      expect(localStorage.removeItem).toHaveBeenCalledWith(itemKey);
    });

    it('should calls localStorage.clear', async () => {
      const safeStorage = makeSut();
      const key1 = faker.random.word();
      const key2 = faker.random.word();
      const anyValue = faker.random.word();

      await safeStorage.setItem(key1, anyValue);
      await safeStorage.setItem(key2, anyValue);
      let safeStorageLength = await safeStorage.length;

      expect(localStorage.length).toBe(2);
      expect(safeStorageLength).toBe(2);

      await safeStorage.clear();

      safeStorageLength = await safeStorage.length;

      expect(localStorage.length).toBe(0);
      expect(safeStorageLength).toBe(0);
    });

    it('should get correct key insted of index', async () => {
      const safeStorage = makeSut();
      const key1 = faker.random.word();
      const key2 = faker.random.word();

      await safeStorage.setItem(key1, 'any_value');
      await safeStorage.setItem(key2, 'any_value');

      const safeKey1 = await safeStorage.key(0);
      const safeKey2 = await safeStorage.key(1);
      const safeKey3 = await safeStorage.key(2);

      expect(safeKey1).toBe(key1);
      expect(safeKey2).toBe(key2);
      expect(safeKey3).toBeFalsy();
    });

    it('should return string if stateManagementUse is true', async () => {
      const safeStorage = makeSut({ stateManagementUse: true });
      const key = faker.random.word();

      await safeStorage.setItem(key, {
        value: faker.random.word(),
        number: 100,
      });
      const value = await safeStorage.getItem(key);

      expect(typeof value).toBe('string');
    });

    it('should return undefined when key not exists', async () => {
      const safeStorage = makeSut();
      const value = await safeStorage.getItem('unknow_key');

      expect(value).toBe(undefined);
    });

    it('should use prefix with key', async () => {
      const prefix = '@test';
      const key = faker.random.word();
      const safeStorage = makeSut({ prefix });

      await safeStorage.setItem(key, {
        value: faker.random.word(),
        number: 100,
      });
      await safeStorage.getItem(key);

      expect(localStorage.getItem).toHaveBeenCalledWith(`${prefix}:${key}`);
    });

    it('should throws InvalidSecretKeyError if secret key is invalid', () => {
      try {
        makeSut({ secretKey: faker.random.alphaNumeric(8) });
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidSecretKeyError);
      }
    });

    it('should encrypt string and return encrypted value', async () => {
      const safeStorage = makeSut();
      const value = faker.random.word();
      const result = await safeStorage.encryptString(value);

      expect(result).not.toEqual(value);
    });

    it('should dencrypt string and return decrypted value', async () => {
      const safeStorage = makeSut();
      const value = faker.random.word();
      const encryptedValue = await safeStorage.encryptString(value);
      const decryptedValue = await safeStorage.decryptString(encryptedValue);

      expect(decryptedValue).toEqual(value);
    });

    it('should test encryptStorage without options', async () => {
      const safeStorage = makeSut({ noOptions: true });
      const key = faker.random.word();

      await safeStorage.getItem(key);

      expect(localStorage.getItem).toHaveBeenCalledWith(key);
    });

    it('should test Rabbit algorithm', async () => {
      const safeStorage = makeSut({ encAlgorithm: 'Rabbit' });
      const key = faker.random.word();
      const value = faker.random.word();

      await safeStorage.setItem(key, value);
      await safeStorage.getItem(key);

      expect(localStorage.setItem).toHaveBeenCalled();
      expect(localStorage.getItem).toHaveBeenCalledWith(key);
    });

    it('should test RC4 algorithm', async () => {
      const safeStorage = makeSut({ encAlgorithm: 'RC4' });
      const key = faker.random.word();
      const value = faker.random.word();

      await safeStorage.setItem(key, value);
      await safeStorage.getItem(key);

      expect(localStorage.setItem).toHaveBeenCalled();
      expect(localStorage.getItem).toHaveBeenCalledWith(key);
    });

    it('should test RC4Drop algorithm', async () => {
      const safeStorage = makeSut({ encAlgorithm: 'RC4Drop' });
      const key = faker.random.word();
      const value = faker.random.word();

      await safeStorage.setItem(key, value);
      await safeStorage.getItem(key);

      expect(localStorage.setItem).toHaveBeenCalled();
      expect(localStorage.getItem).toHaveBeenCalledWith(key);
    });
  });
