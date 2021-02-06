import 'jest-localstorage-mock';

import SafeStorage from '..';

const makeSut = (
  prefix = '',
  storageType: 'localStorage' | 'sessionStorage' = 'localStorage',
): SafeStorage => {
  const secretKey = 'secret_key_safe_storage';
  return new SafeStorage(secretKey, prefix, storageType);
};

describe('SafeStorage', () => {
  it('should enshure localStorage been called', () => {
    const safeStorage = makeSut();
    const key = 'any_key';

    safeStorage.setItem(key, 'any_value');

    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should enshure sessionStorage been called', () => {
    const safeStorage = makeSut('', 'sessionStorage');
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
});
