import 'jest-localstorage-mock';

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
    secretKey = 'secret_storage_key',
  } = params;
  return EncryptStorage(secretKey, { prefix, storageType, stateManagementUse });
};

describe('SafeStorage', () => {
  it('should enshure localStorage been called', () => {
    const safeStorage = makeSut();
    const key = 'any_key';

    safeStorage.setItem(key, 'any_value');

    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should enshure sessionStorage been called', () => {
    const safeStorage = makeSut({ storageType: 'sessionStorage' });
    const key = 'any_key';

    safeStorage.setItem(key, 'any_value');

    expect(sessionStorage.setItem).toHaveBeenCalled();
  });

  it('should calls localStorage.getItem with correct key', () => {
    const safeStorage = makeSut();
    const key = 'any_key';

    safeStorage.getItem(key);

    expect(localStorage.getItem).toHaveBeenCalledWith(key);
  });

  it('should localStorage.getItem returns correct decrypted value', () => {
    const safeStorage = makeSut();
    const key = 'any_key';
    const value = { value: 'any_fake_value' };

    safeStorage.setItem(key, value);
    const storagedDecrypetdValue = safeStorage.getItem(key);

    expect(storagedDecrypetdValue).toEqual(value);
  });

  it('should calls localStorage.removeItem with correct key', () => {
    const safeStorage = makeSut();
    const key = 'any_key';

    safeStorage.removeItem(key);

    expect(localStorage.removeItem).toHaveBeenCalledWith(key);
  });

  it('should calls localStorage.clear', () => {
    const safeStorage = makeSut();

    safeStorage.setItem('any_key_1', 'any_value');
    safeStorage.setItem('any_key_2', 'any_value');

    expect(localStorage.length).toBe(2);

    safeStorage.clear();

    expect(localStorage.length).toBe(0);
  });

  it('should get correct key insted of index', () => {
    const safeStorage = makeSut();

    safeStorage.setItem('any_key_1', 'any_value');
    safeStorage.setItem('any_key_2', 'any_value');

    expect(safeStorage.key(0)).toBe('any_key_1');
    expect(safeStorage.key(1)).toBe('any_key_2');
    expect(safeStorage.key(2)).toBeFalsy();
  });

  it('should return string if stateManagementUse is true', () => {
    const safeStorage = makeSut({ stateManagementUse: true });

    safeStorage.setItem('any_key', { value: 'any_value', number: 100 });
    const value = safeStorage.getItem('any_key');

    expect(typeof value).toBe('string');
  });

  it('should return undefined when key not exists', () => {
    const safeStorage = makeSut();

    expect(safeStorage.getItem('unknow_key')).toBe(undefined);
  });

  it('should use prefix with key', () => {
    const prefix = '@test';
    const key = 'any_key';
    const safeStorage = makeSut({ prefix });

    safeStorage.setItem(key, { value: 'any_value', number: 100 });
    safeStorage.getItem(key);

    expect(localStorage.getItem).toHaveBeenCalledWith(`${prefix}:${key}`);
  });

  it('should throws InvalidSecretKeyError if secret key is invalid', () => {
    try {
      EncryptStorage('12345678');
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidSecretKeyError);
    }
  });
});
