import 'jest-localstorage-mock';

import { SafeStorage } from '..';

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
    const value = { value: 'any_value' };

    safeStorage.setItem(key, value);
    const storagedDecrypetdValue = safeStorage.getItem(key);

    expect(storagedDecrypetdValue).toEqual(value);
  });
});
