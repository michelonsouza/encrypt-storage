import { fakerPT_BR as faker } from '@faker-js/faker';

import { EncryptStorageCryptoJs, EncryptStorage } from '@/classes';
import { InvalidSecretKeyError } from '@/errors';

import type { NotifyHandlerParams, SyncEncryptStorageOptions } from '@/@types';

interface makeSutParams extends Omit<SyncEncryptStorageOptions, 'engine'> {
  secretKey?: string;
  noOptions?: boolean;
  noNotifyHandler?: boolean;
}

const mockNotify = {
  mockedFn: vi.fn().mockImplementation((params: NotifyHandlerParams) => {
    return params;
  }),
};

export const makeSut = (
  params: makeSutParams = {} as makeSutParams,
): EncryptStorageCryptoJs => {
  const {
    prefix,
    storageType,
    stateManagementUse,
    noOptions,
    encAlgorithm,
    noNotifyHandler = false,
    doNotParseValues = false,
    notifyHandler = noNotifyHandler ? undefined : mockNotify.mockedFn,
    secretKey = faker.string.alphanumeric(10),
  } = params;
  const options: SyncEncryptStorageOptions = noOptions
    ? { engine: 'crypto-js' }
    : {
        prefix,
        storageType,
        encAlgorithm,
        notifyHandler,
        doNotParseValues,
        engine: 'crypto-js',
        stateManagementUse,
      };
  return EncryptStorage.create(secretKey, options);
};

describe('EncryptStorageCryptoJs 📦', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should enshure localStorage been called', () => {
    const sut = makeSut();
    const key = faker.string.alphanumeric(5);

    sut.setItem(key, faker.word.sample());

    expect(localStorage.setItem).toHaveBeenCalledTimes(1);
  });

  it('should enshure sessionStorage been called', () => {
    const sut = makeSut({ storageType: 'sessionStorage' });
    const key = faker.string.alphanumeric(5);

    sut.setItem(key, faker.word.sample());

    expect(sessionStorage.setItem).toHaveBeenCalledTimes(1);
  });

  it('should calls localStorage.getItem with correct key', () => {
    const sut = makeSut();
    const key = faker.string.alphanumeric(5);
    const spy = vi.spyOn(mockNotify, 'mockedFn');

    const result = sut.getItem<string>(key);

    expect(localStorage.getItem).toHaveBeenCalledWith(key);
    expect(spy).toHaveBeenCalledWith({
      value: result,
      key,
      type: 'get',
    });
  });

  it('should calls localStorage.getItem without notifyHandler', () => {
    const sut = makeSut({ noNotifyHandler: true });
    const key = faker.string.alphanumeric(5);

    sut.getItem<string>(key);

    expect(localStorage.getItem).toHaveBeenCalledWith(key);
  });

  it('should localStorage.getItem returns correct decrypted value', () => {
    const sut = makeSut();
    const key = faker.string.alphanumeric(5);
    const value = { value: faker.word.sample() };

    sut.setItem(key, value);
    const storagedDecrypetdValue = sut.getItem(key);

    expect(storagedDecrypetdValue).toEqual(value);
  });

  it('should localStorage.getItem returns correct decrypted value with doNotParseValues option', () => {
    const sut = makeSut({
      doNotParseValues: true,
    });
    const values = ['[]', '{}', 'null', 'undefined', 'true', 'false', '123'];
    const key = faker.string.alphanumeric(5);
    const value = faker.helpers.arrayElement(values);

    sut.setItem(key, value);
    const storagedDecrypetdValue = sut.getItem(key);

    expect(storagedDecrypetdValue).toEqual(value);
  });

  it('should localStorage.getItem returns correct value but not decrypt', () => {
    const sut = makeSut();
    const key = faker.string.alphanumeric(5);
    const value = { value: faker.word.sample() };

    sut.setItem(key, value, true);
    const storagedDecrypetdValue = sut.getItem(key, true);

    expect(storagedDecrypetdValue).toEqual(value);
  });

  it('should localStorage.setItem called when setMultipleItems is called without notifyHandler', () => {
    const sut = makeSut({ noNotifyHandler: true });
    const key1 = faker.word.sample();
    const key2 = faker.word.sample();
    const value1 = faker.word.sample();
    const value2 = {
      [faker.word.sample()]: faker.string.alphanumeric(),
    };

    sut.setMultipleItems([
      [key1, value1],
      [key2, value2],
    ]);

    expect(localStorage.setItem).toHaveBeenCalledTimes(2);
  });

  it('should localStorage.setItem called without notifyHandler', () => {
    const sut = makeSut({ noNotifyHandler: true });
    const key = faker.word.sample();
    const value = faker.word.sample();

    sut.setItem(key, value);

    expect(localStorage.setItem).toHaveBeenCalledTimes(1);
  });

  it('should localStorage.setItem called when setMultipleItems is called', () => {
    const sut = makeSut();
    const key1 = faker.word.sample();
    const key2 = faker.word.sample();
    const value1 = faker.word.sample();
    const value2 = {
      [faker.word.sample()]: faker.string.alphanumeric(),
    };

    sut.setMultipleItems([
      [key1, value1],
      [key2, value2],
    ]);

    expect(localStorage.setItem).toHaveBeenCalledTimes(2);
  });

  it('should localStorage.getItem returns correct decrypted value when getMultipleItems is called', () => {
    const sut = makeSut();
    const key1 = faker.word.sample();
    const key2 = faker.word.sample();
    const key3 = faker.word.sample();
    const value1 = faker.word.sample();
    const value2 = {
      [faker.word.sample()]: faker.string.alphanumeric(),
      [faker.word.sample()]: faker.string.alphanumeric(),
    };

    sut.setMultipleItems([
      [key1, value1],
      [key2, value2],
    ]);

    const storagedDecrypetdValue = sut.getMultipleItems([key1, key2, key3]);
    const expectedValue = {
      [key1]: value1,
      [key2]: value2,
      [key3]: undefined,
    };

    expect(storagedDecrypetdValue).toEqual(expectedValue);
  });

  it('should localStorage.getItem returns correct decrypted value when getMultipleItems is called without notifyHandler', () => {
    const sut = makeSut({ noNotifyHandler: true });
    const key1 = faker.word.sample();
    const key2 = faker.word.sample();
    const key3 = faker.word.sample();
    const value1 = faker.word.sample();
    const value2 = {
      [faker.word.sample()]: faker.string.alphanumeric(),
      [faker.word.sample()]: faker.string.alphanumeric(),
    };

    sut.setMultipleItems([
      [key1, value1],
      [key2, value2],
    ]);

    const storagedDecrypetdValue = sut.getMultipleItems([key1, key2, key3]);
    const expectedValue = {
      [key1]: value1,
      [key2]: value2,
      [key3]: undefined,
    };

    expect(storagedDecrypetdValue).toEqual(expectedValue);
  });

  it('should localStorage.getItem returns correct decrypted value when is a string', () => {
    const sut = makeSut();
    const key = faker.string.alphanumeric(5);
    const value = faker.word.sample();

    sut.setItem(key, value);
    const storagedDecrypetdValue = sut.getItem(key);

    expect(storagedDecrypetdValue).toEqual(value);
  });

  it('should calls localStorage.removeItem with correct key', () => {
    const sut = makeSut();
    const key = faker.string.alphanumeric(5);

    sut.removeItem(key);

    expect(localStorage.removeItem).toHaveBeenCalledWith(key);
  });

  it('should calls localStorage.removeItem with correct prefix and key', () => {
    const prefix = faker.word.sample();
    const sut = makeSut({ prefix });
    const key = faker.string.alphanumeric(5);
    const composedKey = `${prefix}:${key}`;

    sut.removeItem(key);

    expect(localStorage.removeItem).toHaveBeenCalledWith(composedKey);
  });

  it('should calls localStorage.getItem for all items with this pattern', () => {
    const sut = makeSut();
    const pattern = faker.string.alphanumeric(8);
    const userKey = `${pattern}:user`;
    const itemKey = `${pattern}:item`;

    const mockedValue = {
      [userKey]: { id: faker.number.int({ min: 1, max: 1000 }) },
      [itemKey]: { id: faker.number.int({ min: 1, max: 1000 }) },
    };

    sut.setItem(userKey, mockedValue[userKey]);
    sut.setItem(itemKey, mockedValue[itemKey]);

    const storagedValue = sut.getItemFromPattern(pattern);

    expect(localStorage.getItem).toHaveBeenCalledWith(userKey);
    expect(localStorage.getItem).toHaveBeenCalledWith(itemKey);
    expect(storagedValue).toEqual(mockedValue);
  });

  it('should calls localStorage.getItem for all items with this pattern without notifyHandler', () => {
    const sut = makeSut({ noNotifyHandler: true });
    const pattern = faker.string.alphanumeric(8);
    const userKey = `${pattern}:user`;
    const itemKey = `${pattern}:item`;

    const mockedValue = {
      [userKey]: { id: faker.number.int({ min: 1, max: 1000 }) },
      [itemKey]: { id: faker.number.int({ min: 1, max: 1000 }) },
    };

    sut.setItem(userKey, mockedValue[userKey]);
    sut.setItem(itemKey, mockedValue[itemKey]);

    const storagedValue = sut.getItemFromPattern(pattern);

    expect(localStorage.getItem).toHaveBeenCalledWith(userKey);
    expect(localStorage.getItem).toHaveBeenCalledWith(itemKey);
    expect(storagedValue).toEqual(mockedValue);
  });

  it('should calls localStorage.getItem for all items with this pattern and remove prefix key', () => {
    const prefix = faker.word.sample();
    const sut = makeSut({
      prefix,
    });
    const pattern = faker.string.alphanumeric(8);
    const userKey = `${pattern}:user`;
    const itemKey = `${pattern}:item`;

    const mockedValue = {
      [userKey]: { id: faker.number.int({ min: 1, max: 1000 }) },
      [itemKey]: { id: faker.number.int({ min: 1, max: 1000 }) },
    };

    sut.setItem(userKey, mockedValue[userKey]);
    sut.setItem(itemKey, mockedValue[itemKey]);

    const storagedValue = sut.getItemFromPattern(pattern);

    expect(localStorage.getItem).toHaveBeenCalledWith(`${prefix}:${userKey}`);
    expect(localStorage.getItem).toHaveBeenCalledWith(`${prefix}:${itemKey}`);
    expect(storagedValue).toEqual(mockedValue);
  });

  it('should calls localStorage.getItem for item with this exact pattern', () => {
    const sut = makeSut();
    const userKey = 'user';
    const itemKey = 'item';

    const mockedValue = {
      [userKey]: { id: faker.number.int({ min: 1, max: 1000 }) },
      [itemKey]: { id: faker.number.int({ min: 1, max: 1000 }) },
    };

    sut.setItem(userKey, mockedValue[userKey]);
    sut.setItem(itemKey, mockedValue[itemKey]);

    const storagedValue = sut.getItemFromPattern(itemKey, {
      exact: true,
      multiple: false,
    });

    const notHaveValue = sut.getItemFromPattern(faker.string.uuid(), {
      exact: true,
      multiple: false,
    });

    expect(localStorage.getItem).toHaveBeenCalledWith(itemKey);
    expect(notHaveValue).toBe(undefined);
    expect(storagedValue).toEqual(mockedValue[itemKey]);
  });

  it('should calls localStorage.getItem for item with this exact pattern without notifyHandler', () => {
    const sut = makeSut({ noNotifyHandler: true });
    const userKey = 'user';
    const itemKey = 'item';

    const mockedValue = {
      [userKey]: { id: faker.number.int({ min: 1, max: 1000 }) },
      [itemKey]: { id: faker.number.int({ min: 1, max: 1000 }) },
    };

    sut.setItem(userKey, mockedValue[userKey]);
    sut.setItem(itemKey, mockedValue[itemKey]);

    const storagedValue = sut.getItemFromPattern(itemKey, {
      exact: true,
      multiple: false,
    });

    const notHaveValue = sut.getItemFromPattern(faker.string.uuid(), {
      exact: true,
      multiple: false,
    });

    expect(localStorage.getItem).toHaveBeenCalledWith(itemKey);
    expect(notHaveValue).toBe(undefined);
    expect(storagedValue).toEqual(mockedValue[itemKey]);
  });

  it('should calls localStorage.getItem for item with this pattern and prefix no multiple', () => {
    const pattern = faker.word.sample();
    const prefix = faker.word.sample();
    const sut = makeSut({
      prefix,
    });
    const userKey = `${pattern}:user`;
    const itemKey = `${pattern}:item`;

    const mockedValue = {
      [userKey]: { id: faker.number.int({ min: 1, max: 1000 }) },
      [itemKey]: { id: faker.number.int({ min: 1, max: 1000 }) },
    };

    sut.setItem(userKey, mockedValue[userKey]);
    sut.setItem(itemKey, mockedValue[itemKey]);

    const storagedValue = sut.getItemFromPattern(itemKey, {
      multiple: false,
    });

    const notHaveValue = sut.getItemFromPattern(faker.string.uuid(), {
      multiple: false,
    });

    expect(localStorage.getItem).toHaveBeenCalledWith(`${prefix}:${itemKey}`);
    expect(notHaveValue).toBe(undefined);
    expect(storagedValue).toEqual(mockedValue[itemKey]);
  });

  it('should calls localStorage.getItem with getItemFromPattern returns undefined', () => {
    const sut = makeSut();
    const pattern = faker.string.alphanumeric(8);

    const storagedValue = sut.getItemFromPattern(pattern);

    expect(storagedValue).toEqual(undefined);
  });

  it('should calls localStorage.removeItem for all items with this pattern', () => {
    const sut = makeSut();
    const pattern = faker.string.alphanumeric(8);
    const userKey = `${pattern}:user`;
    const itemKey = `${pattern}:item`;

    sut.setItem(userKey, { id: faker.string.nanoid() });
    sut.setItem(itemKey, { id: faker.string.nanoid() });

    sut.removeItemFromPattern(pattern);

    expect(localStorage.removeItem).toHaveBeenCalledWith(userKey);
    expect(localStorage.removeItem).toHaveBeenCalledWith(itemKey);
  });

  it('should calls localStorage.removeItem for all items with this pattern without notifyHandler', () => {
    const sut = makeSut({ noNotifyHandler: true });
    const pattern = faker.string.alphanumeric(8);
    const userKey = `${pattern}:user`;
    const itemKey = `${pattern}:item`;

    sut.setItem(userKey, { id: faker.string.nanoid() });
    sut.setItem(itemKey, { id: faker.string.nanoid() });

    sut.removeItemFromPattern(pattern);

    expect(localStorage.removeItem).toHaveBeenCalledWith(userKey);
    expect(localStorage.removeItem).toHaveBeenCalledWith(itemKey);
  });

  it('should calls localStorage.removeItem for all items with this pattern and prefix', () => {
    const prefix = faker.word.sample();
    const sut = makeSut({
      prefix,
    });
    const pattern = faker.string.alphanumeric(8);
    const userKey = `${pattern}:user`;
    const itemKey = `${pattern}:item`;

    sut.setItem(userKey, { id: faker.string.nanoid() });
    sut.setItem(itemKey, { id: faker.string.nanoid() });

    sut.removeItemFromPattern(pattern);

    expect(localStorage.removeItem).toHaveBeenCalledWith(
      `${prefix}:${userKey}`,
    );
    expect(localStorage.removeItem).toHaveBeenCalledWith(
      `${prefix}:${itemKey}`,
    );
  });

  it('should calls localStorage.removeItem for all items with this exact pattern', () => {
    const sut = makeSut();
    const userKey = 'user';
    const itemKey = 'item';

    sut.setItem(userKey, { id: faker.string.nanoid() });
    sut.setItem(itemKey, { id: faker.string.nanoid() });

    sut.removeItemFromPattern(itemKey, { exact: true });

    expect(localStorage.removeItem).toHaveBeenCalledWith(itemKey);
  });

  it('should calls localStorage.removeItem when removeMultipleItems is called', () => {
    const sut = makeSut();
    const userKey = 'user';
    const itemKey = 'item';

    sut.setItem(userKey, { id: faker.string.nanoid() });
    sut.setItem(itemKey, { id: faker.string.nanoid() });

    sut.removeMultipleItems([userKey, itemKey]);

    expect(localStorage.removeItem).toHaveBeenCalledWith(userKey);
    expect(localStorage.removeItem).toHaveBeenCalledWith(itemKey);
  });

  it('should calls localStorage.removeItem when removeMultipleItems is called without notifyHandler', () => {
    const sut = makeSut({ noNotifyHandler: true });
    const userKey = 'user';
    const itemKey = 'item';

    sut.setItem(userKey, { id: faker.string.nanoid() });
    sut.setItem(itemKey, { id: faker.string.nanoid() });

    sut.removeMultipleItems([userKey, itemKey]);

    expect(localStorage.removeItem).toHaveBeenCalledWith(userKey);
    expect(localStorage.removeItem).toHaveBeenCalledWith(itemKey);
  });

  it('should calls localStorage.length without notifyHandler', () => {
    const sut = makeSut({ noNotifyHandler: true });
    const key1 = faker.word.sample();
    const key2 = faker.word.sample();
    const anyValue = faker.word.sample();

    sut.setItem(key1, anyValue);
    sut.setItem(key2, anyValue);

    expect(localStorage.length).toBe(2);
    expect(sut.length).toBe(2);
  });

  it('should calls localStorage.clear', () => {
    const sut = makeSut();
    const key1 = faker.word.sample();
    const key2 = faker.word.sample();
    const anyValue = faker.word.sample();

    sut.setItem(key1, anyValue);
    sut.setItem(key2, anyValue);

    expect(localStorage.length).toBe(2);
    expect(sut.length).toBe(2);

    sut.clear();

    expect(localStorage.length).toBe(0);
    expect(sut.length).toBe(0);
  });

  it('should calls localStorage.clear without notifyHandler', () => {
    const sut = makeSut({ noNotifyHandler: true });
    const key1 = faker.word.sample();
    const key2 = faker.word.sample();
    const anyValue = faker.word.sample();

    sut.setItem(key1, anyValue);
    sut.setItem(key2, anyValue);

    expect(localStorage.length).toBe(2);
    expect(sut.length).toBe(2);

    sut.clear();

    expect(localStorage.length).toBe(0);
    expect(sut.length).toBe(0);
  });

  it('should get correct key insted of index', () => {
    const sut = makeSut();
    const key1 = faker.word.sample();
    const key2 = faker.word.sample();

    sut.setItem(key1, 'any_value');
    sut.setItem(key2, 'any_value');

    expect(sut.key(0)).toBe(key1);
    expect(sut.key(1)).toBe(key2);
    expect(sut.key(2)).toBeFalsy();
  });

  it('should get correct key insted of index without notifyHandler', () => {
    const sut = makeSut({ noNotifyHandler: true });
    const key1 = faker.word.sample();
    const key2 = faker.word.sample();

    sut.setItem(key1, 'any_value');
    sut.setItem(key2, 'any_value');

    expect(sut.key(0)).toBe(key1);
    expect(sut.key(1)).toBe(key2);
    expect(sut.key(2)).toBeFalsy();
  });

  it('should return string if stateManagementUse is true', () => {
    const sut = makeSut({ stateManagementUse: true });
    const key = faker.string.alphanumeric(5);

    sut.setItem(key, { value: faker.word.sample(), number: 100 });
    const value = sut.getItem(key);

    expect(typeof value).toBe('string');
  });

  it('should return string if stateManagementUse is true and without notifyHandler', () => {
    const sut = makeSut({ stateManagementUse: true, noNotifyHandler: true });
    const key = faker.string.alphanumeric(5);

    sut.setItem(key, { value: faker.word.sample(), number: 100 });
    const value = sut.getItem(key);

    expect(typeof value).toBe('string');
  });

  it('should return undefined when key not exists', () => {
    const sut = makeSut();
    const value = sut.getItem('unknow_key');

    expect(value).toBe(undefined);
  });

  it('should use prefix with key', () => {
    const prefix = '@test';
    const key = faker.string.alphanumeric(5);
    const sut = makeSut({ prefix });

    sut.setItem(key, { value: faker.word.sample(), number: 100 });
    sut.getItem(key);

    expect(localStorage.getItem).toHaveBeenCalledWith(`${prefix}:${key}`);
  });

  it('should throws InvalidSecretKeyError if secret key is invalid', () => {
    try {
      makeSut({ secretKey: faker.string.alphanumeric(8) });
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidSecretKeyError);
    }
  });

  it('should encrypt value and return encrypted value', () => {
    const sut = makeSut();
    const value = {
      name: faker.word.sample(),
      id: faker.string.uuid(),
    };
    const result = sut.encryptValue(value);

    expect(result).not.toEqual(value);
  });

  it('should encrypt value and return encrypted value with doNotParseValues option', () => {
    const sut = makeSut({ doNotParseValues: true });
    const value = {
      name: faker.word.sample(),
      id: faker.string.uuid(),
    };
    const stringfyValue = JSON.stringify(value);
    const result = sut.encryptValue(stringfyValue);

    expect(result).not.toEqual(stringfyValue);
  });

  it('should decrypt value and return decrypted value', () => {
    const sut = makeSut();
    const value = {
      name: faker.word.sample(),
      id: faker.string.uuid(),
    };
    const encryptedValue = sut.encryptValue(value);
    const decryptedValue = sut.decryptValue<typeof value>(encryptedValue);

    expect(decryptedValue).toEqual(value);
  });

  it('should decrypt value and return decrypted value with doNotParseValues option', () => {
    const sut = makeSut({ doNotParseValues: true });
    const value = {
      name: faker.word.sample(),
      id: faker.string.nanoid(),
    };
    const stringfyValue = JSON.stringify(value);
    const encryptedValue = sut.encryptValue(stringfyValue);
    const decryptedValue = sut.decryptValue<typeof value>(encryptedValue);

    expect(decryptedValue).toEqual(stringfyValue);
  });

  it('should test encryptStorage without options', () => {
    const sut = makeSut({ noOptions: true });
    const key = faker.string.alphanumeric(5);

    sut.getItem(key);

    expect(localStorage.getItem).toHaveBeenCalledWith(key);
  });

  it('should test AES-CFB algorithm', () => {
    const sut = makeSut({ encAlgorithm: 'AES-CFB' });
    const key = faker.string.alphanumeric(5);
    const value = faker.word.sample();

    sut.setItem(key, value);
    sut.getItem(key);

    expect(localStorage.setItem).toHaveBeenCalled();
    expect(localStorage.getItem).toHaveBeenCalledWith(key);
  });

  it('should test AES-CTR algorithm', () => {
    const sut = makeSut({ encAlgorithm: 'AES-CTR' });
    const key = faker.string.alphanumeric(5);
    const value = faker.word.sample();

    sut.setItem(key, value);
    sut.getItem(key);

    expect(localStorage.setItem).toHaveBeenCalled();
    expect(localStorage.getItem).toHaveBeenCalledWith(key);
  });

  it('should test AES-ECB algorithm', () => {
    const sut = makeSut({ encAlgorithm: 'AES-ECB' });
    const key = faker.string.alphanumeric(5);
    const value = faker.word.sample();

    sut.setItem(key, value);
    sut.getItem(key);

    expect(localStorage.setItem).toHaveBeenCalled();
    expect(localStorage.getItem).toHaveBeenCalledWith(key);
  });

  it('should test AES-OFB algorithm', () => {
    const sut = makeSut({ encAlgorithm: 'AES-OFB' });
    const key = faker.string.alphanumeric(5);
    const value = faker.word.sample();

    sut.setItem(key, value);
    sut.getItem(key);

    expect(localStorage.setItem).toHaveBeenCalled();
    expect(localStorage.getItem).toHaveBeenCalledWith(key);
  });

  it('should be hash any string with SHA256 algorithm', () => {
    const sut = makeSut();
    const value = faker.word.sample(3);

    const result = sut.hash(value);

    expect(result).not.toEqual(value);
  });
});
