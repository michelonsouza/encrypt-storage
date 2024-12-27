import { fakerPT_BR as faker } from '@faker-js/faker';

import { InvalidSecretKeyError } from '@/errors';
import { clearCookies } from '@/utils';
import { makeSut, mockNotify } from '@/utils/test-utils';

describe('EncryptStorage: localStorage', () => {
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

  it('should localStorage.length returns correect value', () => {
    const encryptStorage = makeSut();
    const key1 = faker.word.words(1);
    const key2 = faker.word.words(1);
    const value1 = faker.word.words(1);
    const value2 = {
      [faker.word.words(1)]: faker.string.alphanumeric(),
    };

    encryptStorage.setItem(key1, value1);
    encryptStorage.setItem(key2, value2);

    const result = encryptStorage.length;

    expect(result).toEqual(2);
  });

  it('should calls localStorage.getItem with correct key', () => {
    const spy = vitest.spyOn(mockNotify, 'mockedFn');

    const encryptStorage = makeSut({
      notifyHandler: mockNotify.mockedFn,
    });

    const key = faker.word.words(1);

    const result = encryptStorage.getItem<string>(key);

    expect(localStorage.getItem).toHaveBeenCalledWith(key);
    expect(spy).toHaveBeenCalledWith({
      value: result,
      key,
      type: 'get',
    });
  });

  it('should localStorage.getItem returns correct decrypted value', () => {
    const encryptStorage = makeSut();
    const key = faker.word.words(1);
    const value = { value: faker.word.words(1) };

    encryptStorage.setItem(key, value);
    const storagedDecrypetdValue = encryptStorage.getItem(key);

    expect(storagedDecrypetdValue).toEqual(value);
  });

  it('should localStorage.getItem returns correct decrypted value with doNotParseValues option', () => {
    const encryptStorage = makeSut({
      doNotParseValues: true,
    });
    const values = ['[]', '{}', 'null', 'undefined', 'true', 'false', '123'];
    const key = faker.word.words(1);
    const value = faker.helpers.arrayElement(values);

    encryptStorage.setItem(key, value);

    const storagedDecrypetdValue = encryptStorage.getItem(key);

    expect(storagedDecrypetdValue).toEqual(value);
  });

  it('should localStorage.getItem returns correct value but not decrypt', () => {
    const encryptStorage = makeSut();
    const key = faker.word.words(1);
    const value = { value: faker.word.words(1) };

    encryptStorage.setItem(key, value, { doNotEncrypt: true });
    const storagedDecrypetdValue = encryptStorage.getItem(key, true);

    expect(storagedDecrypetdValue).toEqual(value);
  });

  it('should localStorage.setItem called when setMultipleItems is called', () => {
    const encryptStorage = makeSut();
    const key1 = faker.word.words(1);
    const key2 = faker.word.words(1);
    const value1 = faker.word.words(1);
    const value2 = {
      [faker.word.words(1)]: faker.string.alphanumeric(),
    };

    encryptStorage.setMultipleItems([
      [key1, value1],
      [key2, value2],
    ]);

    expect(localStorage.setItem).toHaveBeenCalledTimes(2);
  });

  it('should localStorage.getItem returns correct decrypted value when getMultipleItems is called', () => {
    const encryptStorage = makeSut();
    const key1 = faker.word.words(1);
    const key2 = faker.word.words(1);
    const key3 = faker.word.words(1);
    const value1 = faker.word.words(1);
    const value2 = {
      [faker.word.words(1)]: faker.string.alphanumeric(),
    };

    encryptStorage.setMultipleItems([
      [key1, value1],
      [key2, value2],
    ]);

    const storagedDecrypetdValue = encryptStorage.getMultipleItems([
      key1,
      key2,
      key3,
    ]);
    const expectedValue = {
      [key1]: value1,
      [key2]: value2,
      [key3]: null,
    };

    expect(storagedDecrypetdValue).toEqual(expectedValue);
  });

  it('should localStorage.getItem returns correct decrypted value when is a string', () => {
    const encryptStorage = makeSut();
    const key = faker.word.words(1);
    const value = faker.word.words(1);

    encryptStorage.setItem(key, value);
    const storagedDecrypetdValue = encryptStorage.getItem(key);

    expect(storagedDecrypetdValue).toEqual(value);
  });

  it('should calls localStorage.removeItem with correct key', () => {
    const encryptStorage = makeSut();
    const key = faker.word.words(1);

    encryptStorage.removeItem(key);

    expect(localStorage.removeItem).toHaveBeenCalledWith(key);
  });

  it('should calls localStorage.removeItem with correct prefix and key', () => {
    const prefix = faker.word.words(1);
    const encryptStorage = makeSut({ prefix });
    const key = faker.word.words(1);
    const composedKey = `${prefix}:${key}`;

    encryptStorage.removeItem(key);

    expect(localStorage.removeItem).toHaveBeenCalledWith(composedKey);
  });

  it('should calls localStorage.getItem for all items with this pattern', () => {
    const encryptStorage = makeSut();
    const pattern = faker.string.alphanumeric(8);
    const userKey = `${pattern}:user`;
    const itemKey = `${pattern}:item`;

    const mockedValue = {
      [userKey]: {
        id: faker.number.int({
          min: 1,
          max: 1000,
        }),
      },
      [itemKey]: {
        id: faker.number.int({
          min: 1,
          max: 1000,
        }),
      },
    };

    encryptStorage.setItem(userKey, mockedValue[userKey]);
    encryptStorage.setItem(itemKey, mockedValue[itemKey]);

    const storagedValue = encryptStorage.getItemFromPattern(pattern);

    expect(localStorage.getItem).toHaveBeenCalledWith(userKey);
    expect(localStorage.getItem).toHaveBeenCalledWith(itemKey);
    expect(storagedValue).toEqual(mockedValue);
  });

  it('should calls localStorage.getItem for all items with this pattern and remove prefix key', () => {
    const prefix = faker.word.words(1);
    const encryptStorage = makeSut({
      prefix,
    });
    const pattern = faker.string.alphanumeric(8);
    const userKey = `${pattern}:user`;
    const itemKey = `${pattern}:item`;

    const mockedValue = {
      [userKey]: {
        id: faker.number.int({
          min: 1,
          max: 1000,
        }),
      },
      [itemKey]: {
        id: faker.number.int({
          min: 1,
          max: 1000,
        }),
      },
    };

    encryptStorage.setItem(userKey, mockedValue[userKey]);
    encryptStorage.setItem(itemKey, mockedValue[itemKey]);

    const storagedValue = encryptStorage.getItemFromPattern(pattern);

    expect(localStorage.getItem).toHaveBeenCalledWith(`${prefix}:${userKey}`);
    expect(localStorage.getItem).toHaveBeenCalledWith(`${prefix}:${itemKey}`);
    expect(storagedValue).toEqual(mockedValue);
  });

  it('should calls localStorage.getItem for item with this exact pattern', () => {
    const encryptStorage = makeSut();
    const userKey = 'user';
    const itemKey = 'item';

    const mockedValue = {
      [userKey]: {
        id: faker.number.int({
          min: 1,
          max: 1000,
        }),
      },
      [itemKey]: {
        id: faker.number.int({
          min: 1,
          max: 1000,
        }),
      },
    };

    encryptStorage.setItem(userKey, mockedValue[userKey]);
    encryptStorage.setItem(itemKey, mockedValue[itemKey]);

    const storagedValue = encryptStorage.getItemFromPattern(itemKey, {
      exact: true,
      multiple: false,
    });

    const notHaveValue = encryptStorage.getItemFromPattern(
      faker.string.uuid(),
      {
        exact: true,
        multiple: false,
      },
    );

    expect(localStorage.getItem).toHaveBeenCalledWith(itemKey);
    expect(notHaveValue).toBe(null);
    expect(storagedValue).toEqual(mockedValue[itemKey]);
  });

  it('should calls localStorage.getItem for item with this pattern and prefix no multiple', () => {
    const pattern = faker.string.alphanumeric(5);
    const prefix = faker.word.words(1);
    const encryptStorage = makeSut({
      prefix,
    });
    const userKey = `${pattern}:user`;
    const itemKey = `${pattern}:item`;

    const mockedValue = {
      [userKey]: {
        id: faker.number.int({
          min: 1,
          max: 1000,
        }),
      },
      [itemKey]: {
        id: faker.number.int({
          min: 1,
          max: 1000,
        }),
      },
    };

    encryptStorage.setItem(userKey, mockedValue[userKey]);
    encryptStorage.setItem(itemKey, mockedValue[itemKey]);

    const storagedValue = encryptStorage.getItemFromPattern(itemKey, {
      multiple: false,
    });

    const notHaveValue = encryptStorage.getItemFromPattern(
      faker.string.uuid(),
      {
        multiple: false,
      },
    );

    expect(localStorage.getItem).toHaveBeenCalledWith(`${prefix}:${itemKey}`);
    expect(notHaveValue).toBe(null);
    expect(storagedValue).toEqual(mockedValue[itemKey]);
  });

  it('should calls localStorage.getItem with getItemFromPattern returns null', () => {
    const encryptStorage = makeSut();
    const pattern = faker.string.alphanumeric(8);

    const storagedValue = encryptStorage.getItemFromPattern(pattern);

    expect(storagedValue).toEqual(null);
  });

  it('should calls localStorage.removeItem for all items with this pattern', () => {
    const encryptStorage = makeSut();
    const pattern = faker.string.alphanumeric(8);
    const userKey = `${pattern}:user`;
    const itemKey = `${pattern}:item`;

    encryptStorage.setItem(userKey, { id: 123 });
    encryptStorage.setItem(itemKey, { id: 456 });

    encryptStorage.removeItemFromPattern(pattern);

    expect(localStorage.removeItem).toHaveBeenCalledWith(userKey);
    expect(localStorage.removeItem).toHaveBeenCalledWith(itemKey);
  });

  it('should calls localStorage.removeItem for all items with this pattern and prefix', () => {
    const prefix = faker.word.words(1);
    const encryptStorage = makeSut({
      prefix,
    });
    const pattern = faker.string.alphanumeric(8);
    const userKey = `${pattern}:user`;
    const itemKey = `${pattern}:item`;

    encryptStorage.setItem(userKey, { id: 123 });
    encryptStorage.setItem(itemKey, { id: 456 });

    encryptStorage.removeItemFromPattern(pattern);

    expect(localStorage.removeItem).toHaveBeenCalledWith(
      `${prefix}:${userKey}`,
    );
    expect(localStorage.removeItem).toHaveBeenCalledWith(
      `${prefix}:${itemKey}`,
    );
  });

  it('should calls localStorage.removeItem for all items with this exact pattern', () => {
    const encryptStorage = makeSut();
    const userKey = 'user';
    const itemKey = 'item';

    encryptStorage.setItem(userKey, { id: 123 });
    encryptStorage.setItem(itemKey, { id: 456 });

    encryptStorage.removeItemFromPattern(itemKey, { exact: true });

    expect(localStorage.removeItem).toHaveBeenCalledWith(itemKey);
  });

  it('should calls localStorage.removeItem when removeMultipleItems is called', () => {
    const encryptStorage = makeSut();
    const userKey = 'user';
    const itemKey = 'item';

    encryptStorage.setItem(userKey, { id: 123 });
    encryptStorage.setItem(itemKey, { id: 456 });

    encryptStorage.removeMultipleItems([userKey, itemKey]);

    expect(localStorage.removeItem).toHaveBeenCalledWith(userKey);
    expect(localStorage.removeItem).toHaveBeenCalledWith(itemKey);
  });

  it('should calls localStorage.clear', () => {
    const encryptStorage = makeSut();
    const key1 = faker.word.words(1);
    const key2 = faker.word.words(1);
    const anyValue = faker.word.words(1);

    encryptStorage.setItem(key1, anyValue);
    encryptStorage.setItem(key2, anyValue);

    expect(localStorage.length).toBe(2);
    expect(encryptStorage.length).toBe(2);

    encryptStorage.clear();

    expect(localStorage.length).toBe(0);
    expect(encryptStorage.length).toBe(0);
  });

  it('should get correct key insted of index', () => {
    const encryptStorage = makeSut();
    const key1 = faker.word.words(1);
    const key2 = faker.word.words(1);

    encryptStorage.setItem(key1, faker.word.words(1));
    encryptStorage.setItem(key2, faker.word.words(1));

    expect(encryptStorage.key(0)).toBe(key1);
    expect(encryptStorage.key(1)).toBe(key2);
    expect(encryptStorage.key(2)).toBeFalsy();
  });

  it('should return string if stateManagementUse is true', () => {
    const encryptStorage = makeSut({ stateManagementUse: true });
    const key = faker.word.words(1);
    const mockedValue = {
      value: faker.word.words(1),
      number: faker.number.int({
        min: 1,
        max: 1000,
      }),
    };

    encryptStorage.setItem(key, mockedValue);

    const value = encryptStorage.getItem(key);

    expect(typeof value).toBe('string');
  });

  it('should return null when key not exists', () => {
    const encryptStorage = makeSut();

    expect(encryptStorage.getItem(faker.word.words(1))).toBe(null);
  });

  it('should use prefix with key', () => {
    const prefix = '@test';
    const key = faker.word.words(1);
    const encryptStorage = makeSut({ prefix });
    const mockedValue = {
      value: faker.word.words(1),
      number: faker.number.int({
        min: 1,
        max: 1000,
      }),
    };

    encryptStorage.setItem(key, mockedValue);
    encryptStorage.getItem(key);

    expect(localStorage.getItem).toHaveBeenCalledWith(`${prefix}:${key}`);
  });

  it('should throws InvalidSecretKeyError if secret key is invalid', () => {
    try {
      makeSut({ secretKey: faker.string.alphanumeric(8) });
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidSecretKeyError);
    }
  });

  it('should encrypt string and return encrypted value', () => {
    const encryptStorage = makeSut();
    const value = faker.word.words(1);
    const result = encryptStorage.encryptString(value);

    expect(result).not.toEqual(value);
  });

  it('should encrypt value and return encrypted value', () => {
    const encryptStorage = makeSut();
    const value = {
      name: faker.word.words(1),
      id: faker.string.uuid(),
    };
    const result = encryptStorage.encryptValue(value);

    expect(result).not.toEqual(value);
  });

  it('should encrypt value and return encrypted value with doNotParseValues option', () => {
    const encryptStorage = makeSut({ doNotParseValues: true });
    const value = {
      name: faker.word.words(1),
      id: faker.string.uuid(),
    };
    const stringfyValue = JSON.stringify(value);
    const result = encryptStorage.encryptValue(stringfyValue);

    expect(result).not.toEqual(stringfyValue);
  });

  it('should decrypt string and return decrypted value', () => {
    const encryptStorage = makeSut();
    const value = faker.word.words(1);
    const encryptedValue = encryptStorage.encryptString(value);
    const decryptedValue = encryptStorage.decryptString(encryptedValue);

    expect(decryptedValue).toEqual(value);
  });

  it('should decrypt value and return decrypted value', () => {
    const encryptStorage = makeSut();
    const value = {
      name: faker.word.words(1),
      id: faker.string.uuid(),
    };
    const encryptedValue = encryptStorage.encryptValue(value);
    const decryptedValue =
      encryptStorage.decryptValue<typeof value>(encryptedValue);

    expect(decryptedValue).toEqual(value);
  });

  it('should decrypt value and return decrypted value with doNotParseValues option', () => {
    const encryptStorage = makeSut({ doNotParseValues: true });
    const value = {
      name: faker.word.words(1),
      id: faker.string.uuid(),
    };
    const stringfyValue = JSON.stringify(value);
    const encryptedValue = encryptStorage.encryptValue(stringfyValue);
    const decryptedValue =
      encryptStorage.decryptValue<typeof value>(encryptedValue);

    expect(decryptedValue).toEqual(stringfyValue);
  });

  it('should test encryptStorage without options', () => {
    const encryptStorage = makeSut({ noOptions: true });
    const key = faker.word.words(1);

    encryptStorage.getItem(key);

    expect(localStorage.getItem).toHaveBeenCalledWith(key);
  });
});
