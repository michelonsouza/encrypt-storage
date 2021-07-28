import 'jest-localstorage-mock';
import faker from 'faker';

import {
  EncryptStorage,
  EncryptStorageTypes,
  EncryptStorageOptions,
} from '../src';

import { InvalidSecretKeyError } from '../src/errors';

interface MakeSutParams extends EncryptStorageOptions {
  secretKey?: string;
}

const makeSut = (
  params: MakeSutParams = {} as MakeSutParams,
): EncryptStorageTypes => {
  const {
    prefix,
    storageType,
    stateManagementUse,
    secretKey = faker.datatype.uuid(),
  } = params;
  return EncryptStorage(secretKey, { prefix, storageType, stateManagementUse });
};

describe('SafeStorage', () => {
  beforeEach(() => {
    localStorage.clear();
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

  it('should calls localStorage.removeItemFromPattern remove all items with this pattern', () => {
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

  it('should calls localStorage.clear', () => {
    const safeStorage = makeSut();
    const key1 = faker.random.word();
    const key2 = faker.random.word();
    const anyValue = faker.random.word();

    safeStorage.setItem(key1, anyValue);
    safeStorage.setItem(key2, anyValue);

    expect(localStorage.length).toBe(2);

    safeStorage.clear();

    expect(localStorage.length).toBe(0);
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
      EncryptStorage(faker.random.alphaNumeric(8));
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

  it('should dencrypt string and return decrypted value', () => {
    const safeStorage = makeSut();
    const value = faker.random.word();
    const encryptedValue = safeStorage.encryptString(value);
    const decryptedValue = safeStorage.decryptString(encryptedValue);

    expect(decryptedValue).toEqual(value);
  });
});
