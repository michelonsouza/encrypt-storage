import { fakerPT_BR as faker } from '@faker-js/faker';

import { EncryptStorageWebApi, EncryptStorage } from '@/classes';
import { InvalidSecretKeyError } from '@/errors';

import type { NotifyHandlerParams, AsyncEncryptStorageOptions } from '@/@types';

interface makeSutParams extends Omit<AsyncEncryptStorageOptions, 'api'> {
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
): EncryptStorageWebApi => {
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
  const options: AsyncEncryptStorageOptions = noOptions
    ? { api: 'web-api' }
    : {
        prefix,
        storageType,
        encAlgorithm,
        notifyHandler,
        doNotParseValues,
        api: 'web-api',
        stateManagementUse,
      };
  return EncryptStorage.create(secretKey, options);
};

describe('EncryptStorageWebApi 📦', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should enshure localStorage been called', async () => {
    const sut = makeSut();
    const key = faker.string.alphanumeric(5);

    await sut.setItem(key, faker.word.sample());

    expect(localStorage.setItem).toHaveBeenCalledTimes(1);
  });

  it('should enshure sessionStorage been called', async () => {
    const sut = makeSut({ storageType: 'sessionStorage' });
    const key = faker.string.alphanumeric(5);

    await sut.setItem(key, faker.word.sample());

    expect(sessionStorage.setItem).toHaveBeenCalledTimes(1);
  });

  it('should calls localStorage.getItem with correct key', async () => {
    const sut = makeSut();
    const key = faker.string.alphanumeric(5);
    const spy = vi.spyOn(mockNotify, 'mockedFn');

    const result = await sut.getItem<string>(key);

    expect(localStorage.getItem).toHaveBeenCalledWith(key);
    expect(spy).toHaveBeenCalledWith({
      value: result,
      key,
      type: 'get',
    });
  });

  it('should calls localStorage.getItem without notifyHandler', async () => {
    const sut = makeSut({ noNotifyHandler: true });
    const key = faker.string.alphanumeric(5);
    const spy = vi.spyOn(mockNotify, 'mockedFn');

    await sut.getItem<string>(key);

    expect(localStorage.getItem).toHaveBeenCalledWith(key);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should localStorage.getItem returns correct decrypted value', async () => {
    const sut = makeSut();
    const key = faker.string.alphanumeric(5);
    const value = { value: faker.word.sample() };

    await sut.setItem(key, value);
    const storagedDecrypetdValue = await sut.getItem(key);

    expect(storagedDecrypetdValue).toEqual(value);
  });

  it('should localStorage.getItem returns correct decrypted value with doNotParseValues option', async () => {
    const sut = makeSut({
      doNotParseValues: true,
    });
    const values = ['[]', '{}', 'null', 'undefined', 'true', 'false', '123'];
    const key = faker.string.alphanumeric(5);
    const value = faker.helpers.arrayElement(values);

    await sut.setItem(key, value);
    const storagedDecrypetdValue = await sut.getItem(key);

    expect(storagedDecrypetdValue).toEqual(value);
  });

  it('should localStorage.getItem returns correct value but not decrypt', async () => {
    const sut = makeSut();
    const key = faker.string.alphanumeric(5);
    const value = { value: faker.word.sample() };

    await sut.setItem(key, value, true);
    const storagedDecrypetdValue = await sut.getItem(key, true);

    expect(storagedDecrypetdValue).toEqual(value);
  });

  it('should localStorage.setItem called when setMultipleItems is called', async () => {
    const sut = makeSut();
    const key1 = faker.word.sample();
    const key2 = faker.word.sample();
    const value1 = faker.word.sample();
    const value2 = {
      [faker.word.sample()]: faker.string.alphanumeric(),
    };

    await sut.setMultipleItems([
      [key1, value1],
      [key2, value2],
    ]);

    expect(localStorage.setItem).toHaveBeenCalledTimes(2);
  });

  it('should localStorage.setItem called when setMultipleItems is called without notifyHandler', async () => {
    const sut = makeSut({ noNotifyHandler: true });
    const key1 = faker.word.sample();
    const key2 = faker.word.sample();
    const value1 = faker.word.sample();
    const value2 = {
      [faker.word.sample()]: faker.string.alphanumeric(),
    };

    await sut.setMultipleItems([
      [key1, value1],
      [key2, value2],
    ]);

    expect(localStorage.setItem).toHaveBeenCalledTimes(2);
  });

  it('should localStorage.setItem called without notifyHandler', async () => {
    const sut = makeSut({ noNotifyHandler: true });
    const key = faker.word.sample();
    const value = faker.word.sample();

    await sut.setItem(key, value);

    expect(localStorage.setItem).toHaveBeenCalledTimes(1);
  });

  it('should localStorage.getItem returns correct decrypted value when getMultipleItems is called', async () => {
    const sut = makeSut();
    const key1 = faker.word.sample();
    const key2 = faker.word.sample();
    const key3 = faker.word.sample();
    const value1 = faker.word.sample();
    const value2 = {
      [faker.word.sample()]: faker.string.alphanumeric(),
      [faker.word.sample()]: faker.string.alphanumeric(),
    };

    await sut.setMultipleItems([
      [key1, value1],
      [key2, value2],
    ]);

    const storagedDecrypetdValue = await sut.getMultipleItems([
      key1,
      key2,
      key3,
    ]);
    const expectedValue = {
      [key1]: value1,
      [key2]: value2,
      [key3]: undefined,
    };

    expect(storagedDecrypetdValue).toEqual(expectedValue);
  });

  it('should localStorage.getItem returns correct decrypted value when getMultipleItems is called without notifyHandler', async () => {
    const sut = makeSut({ noNotifyHandler: true });
    const key1 = faker.word.sample();
    const key2 = faker.word.sample();
    const key3 = faker.word.sample();
    const value1 = faker.word.sample();
    const value2 = {
      [faker.word.sample()]: faker.string.alphanumeric(),
      [faker.word.sample()]: faker.string.alphanumeric(),
    };

    await sut.setMultipleItems([
      [key1, value1],
      [key2, value2],
    ]);

    const storagedDecrypetdValue = await sut.getMultipleItems([
      key1,
      key2,
      key3,
    ]);
    const expectedValue = {
      [key1]: value1,
      [key2]: value2,
      [key3]: undefined,
    };

    expect(storagedDecrypetdValue).toEqual(expectedValue);
  });

  it('should localStorage.getItem returns correct decrypted value when is a string', async () => {
    const sut = makeSut();
    const key = faker.string.alphanumeric(5);
    const value = faker.word.sample();

    await sut.setItem(key, value);
    const storagedDecrypetdValue = await sut.getItem(key);

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

  it('should calls localStorage.getItem for all items with this pattern', async () => {
    const sut = makeSut();
    const pattern = faker.string.alphanumeric(8);
    const userKey = `${pattern}:user`;
    const itemKey = `${pattern}:item`;

    const mockedValue = {
      [userKey]: { id: faker.number.int({ min: 1, max: 1000 }) },
      [itemKey]: { id: faker.number.int({ min: 1, max: 1000 }) },
    };

    await sut.setItem(userKey, mockedValue[userKey]);
    await sut.setItem(itemKey, mockedValue[itemKey]);

    const storagedValue = await sut.getItemFromPattern(pattern);

    expect(localStorage.getItem).toHaveBeenCalledWith(userKey);
    expect(localStorage.getItem).toHaveBeenCalledWith(itemKey);
    expect(storagedValue).toEqual(mockedValue);
  });

  it('should calls localStorage.getItem for all items with this pattern without notifyHandler', async () => {
    const sut = makeSut({ noNotifyHandler: true });
    const pattern = faker.string.alphanumeric(8);
    const userKey = `${pattern}:user`;
    const itemKey = `${pattern}:item`;

    const mockedValue = {
      [userKey]: { id: faker.number.int({ min: 1, max: 1000 }) },
      [itemKey]: { id: faker.number.int({ min: 1, max: 1000 }) },
    };

    await sut.setItem(userKey, mockedValue[userKey]);
    await sut.setItem(itemKey, mockedValue[itemKey]);

    const storagedValue = await sut.getItemFromPattern(pattern);

    expect(localStorage.getItem).toHaveBeenCalledWith(userKey);
    expect(localStorage.getItem).toHaveBeenCalledWith(itemKey);
    expect(storagedValue).toEqual(mockedValue);
  });

  it('should calls localStorage.getItem for all items with this pattern and remove prefix key', async () => {
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

    await sut.setItem(userKey, mockedValue[userKey]);
    await sut.setItem(itemKey, mockedValue[itemKey]);

    const storagedValue = await sut.getItemFromPattern(pattern);

    expect(localStorage.getItem).toHaveBeenCalledWith(`${prefix}:${userKey}`);
    expect(localStorage.getItem).toHaveBeenCalledWith(`${prefix}:${itemKey}`);
    expect(storagedValue).toEqual(mockedValue);
  });

  it('should calls localStorage.getItem for item with this exact pattern', async () => {
    const sut = makeSut();
    const userKey = 'user';
    const itemKey = 'item';

    const mockedValue = {
      [userKey]: { id: faker.number.int({ min: 1, max: 1000 }) },
      [itemKey]: { id: faker.number.int({ min: 1, max: 1000 }) },
    };

    await sut.setItem(userKey, mockedValue[userKey]);
    await sut.setItem(itemKey, mockedValue[itemKey]);

    const storagedValue = await sut.getItemFromPattern(itemKey, {
      exact: true,
      multiple: false,
    });

    const notHaveValue = await sut.getItemFromPattern(faker.string.uuid(), {
      exact: true,
      multiple: false,
    });

    expect(localStorage.getItem).toHaveBeenCalledWith(itemKey);
    expect(notHaveValue).toBe(undefined);
    expect(storagedValue).toEqual(mockedValue[itemKey]);
  });

  it('should calls localStorage.getItem for item with this exact pattern without notifyHandler', async () => {
    const sut = makeSut({ noNotifyHandler: true });
    const userKey = 'user';
    const itemKey = 'item';

    const mockedValue = {
      [userKey]: { id: faker.number.int({ min: 1, max: 1000 }) },
      [itemKey]: { id: faker.number.int({ min: 1, max: 1000 }) },
    };

    await sut.setItem(userKey, mockedValue[userKey]);
    await sut.setItem(itemKey, mockedValue[itemKey]);

    const storagedValue = await sut.getItemFromPattern(itemKey, {
      exact: true,
      multiple: false,
    });

    const notHaveValue = await sut.getItemFromPattern(faker.string.uuid(), {
      exact: true,
      multiple: false,
    });

    expect(localStorage.getItem).toHaveBeenCalledWith(itemKey);
    expect(notHaveValue).toBe(undefined);
    expect(storagedValue).toEqual(mockedValue[itemKey]);
  });

  it('should calls localStorage.getItem for item with this pattern and prefix no multiple', async () => {
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

    await sut.setItem(userKey, mockedValue[userKey]);
    await sut.setItem(itemKey, mockedValue[itemKey]);

    const storagedValue = await sut.getItemFromPattern(itemKey, {
      multiple: false,
    });

    const notHaveValue = await sut.getItemFromPattern(faker.string.uuid(), {
      multiple: false,
    });

    expect(localStorage.getItem).toHaveBeenCalledWith(`${prefix}:${itemKey}`);
    expect(notHaveValue).toBe(undefined);
    expect(storagedValue).toEqual(mockedValue[itemKey]);
  });

  it('should calls localStorage.getItem with getItemFromPattern returns undefined', async () => {
    const sut = makeSut();
    const pattern = faker.string.alphanumeric(8);

    const storagedValue = await sut.getItemFromPattern(pattern);

    expect(storagedValue).toEqual(undefined);
  });

  it('should calls localStorage.removeItem for all items with this pattern', async () => {
    const sut = makeSut();
    const pattern = faker.string.alphanumeric(8);
    const userKey = `${pattern}:user`;
    const itemKey = `${pattern}:item`;

    await sut.setItem(userKey, { id: faker.string.nanoid() });
    await sut.setItem(itemKey, { id: faker.string.nanoid() });

    sut.removeItemFromPattern(pattern);

    expect(localStorage.removeItem).toHaveBeenCalledWith(userKey);
    expect(localStorage.removeItem).toHaveBeenCalledWith(itemKey);
  });

  it('should calls localStorage.removeItem for all items with this pattern without notifyHandler', async () => {
    const sut = makeSut({ noNotifyHandler: true });
    const pattern = faker.string.alphanumeric(8);
    const userKey = `${pattern}:user`;
    const itemKey = `${pattern}:item`;

    await sut.setItem(userKey, { id: faker.string.nanoid() });
    await sut.setItem(itemKey, { id: faker.string.nanoid() });

    sut.removeItemFromPattern(pattern);

    expect(localStorage.removeItem).toHaveBeenCalledWith(userKey);
    expect(localStorage.removeItem).toHaveBeenCalledWith(itemKey);
  });

  it('should calls localStorage.removeItem for all items with this pattern and prefix', async () => {
    const prefix = faker.word.sample();
    const sut = makeSut({
      prefix,
    });
    const pattern = faker.string.alphanumeric(8);
    const userKey = `${pattern}:user`;
    const itemKey = `${pattern}:item`;

    await sut.setItem(userKey, { id: faker.string.nanoid() });
    await sut.setItem(itemKey, { id: faker.string.nanoid() });

    sut.removeItemFromPattern(pattern);

    expect(localStorage.removeItem).toHaveBeenCalledWith(
      `${prefix}:${userKey}`,
    );
    expect(localStorage.removeItem).toHaveBeenCalledWith(
      `${prefix}:${itemKey}`,
    );
  });

  it('should calls localStorage.removeItem for all items with this exact pattern', async () => {
    const sut = makeSut();
    const userKey = 'user';
    const itemKey = 'item';

    await sut.setItem(userKey, { id: faker.string.nanoid() });
    await sut.setItem(itemKey, { id: faker.string.nanoid() });

    sut.removeItemFromPattern(itemKey, { exact: true });

    expect(localStorage.removeItem).toHaveBeenCalledWith(itemKey);
  });

  it('should calls localStorage.removeItem when removeMultipleItems is called', async () => {
    const sut = makeSut();
    const userKey = 'user';
    const itemKey = 'item';

    await sut.setItem(userKey, { id: faker.string.nanoid() });
    await sut.setItem(itemKey, { id: faker.string.nanoid() });

    sut.removeMultipleItems([userKey, itemKey]);

    expect(localStorage.removeItem).toHaveBeenCalledWith(userKey);
    expect(localStorage.removeItem).toHaveBeenCalledWith(itemKey);
  });

  it('should calls localStorage.removeItem when removeMultipleItems is called without notifyHandler', async () => {
    const sut = makeSut({ noNotifyHandler: true });
    const userKey = 'user';
    const itemKey = 'item';

    await sut.setItem(userKey, { id: faker.string.nanoid() });
    await sut.setItem(itemKey, { id: faker.string.nanoid() });

    sut.removeMultipleItems([userKey, itemKey]);

    expect(localStorage.removeItem).toHaveBeenCalledWith(userKey);
    expect(localStorage.removeItem).toHaveBeenCalledWith(itemKey);
  });

  it('should calls localStorage.clear', async () => {
    const sut = makeSut();
    const key1 = faker.word.sample();
    const key2 = faker.word.sample();
    const anyValue = faker.word.sample();

    await sut.setItem(key1, anyValue);
    await sut.setItem(key2, anyValue);

    expect(localStorage.length).toBe(2);
    expect(sut.length).toBe(2);

    sut.clear();

    expect(localStorage.length).toBe(0);
    expect(sut.length).toBe(0);
  });

  it('should calls localStorage.clear without notifyHandler', async () => {
    const sut = makeSut({ noNotifyHandler: true });
    const key1 = faker.word.sample();
    const key2 = faker.word.sample();
    const anyValue = faker.word.sample();

    await sut.setItem(key1, anyValue);
    await sut.setItem(key2, anyValue);

    expect(localStorage.length).toBe(2);
    expect(sut.length).toBe(2);

    sut.clear();

    expect(localStorage.length).toBe(0);
    expect(sut.length).toBe(0);
  });

  it('should get correct key insted of index', async () => {
    const sut = makeSut();
    const key1 = faker.word.sample();
    const key2 = faker.word.sample();

    await sut.setItem(key1, 'any_value');
    await sut.setItem(key2, 'any_value');

    expect(sut.key(0)).toBe(key1);
    expect(sut.key(1)).toBe(key2);
    expect(sut.key(2)).toBeFalsy();
  });

  it('should get correct key insted of index without notifyHandler', async () => {
    const sut = makeSut({ noNotifyHandler: true });
    const key1 = faker.word.sample();
    const key2 = faker.word.sample();

    await sut.setItem(key1, 'any_value');
    await sut.setItem(key2, 'any_value');

    expect(sut.key(0)).toBe(key1);
    expect(sut.key(1)).toBe(key2);
    expect(sut.key(2)).toBeFalsy();
  });

  it('should return string if stateManagementUse is true', async () => {
    const sut = makeSut({ stateManagementUse: true });
    const key = faker.string.alphanumeric(5);

    await sut.setItem(key, { value: faker.word.sample(), number: 100 });
    const value = await sut.getItem(key);

    expect(typeof value).toBe('string');
  });

  it('should return string if stateManagementUse is true and without notifyHandler', async () => {
    const sut = makeSut({ stateManagementUse: true, noNotifyHandler: true });
    const key = faker.string.alphanumeric(5);

    await sut.setItem(key, { value: faker.word.sample(), number: 100 });
    const value = await sut.getItem(key);

    expect(typeof value).toBe('string');
  });

  it('should return undefined when key not exists', async () => {
    const sut = makeSut();
    const value = await sut.getItem('unknow_key');

    expect(value).toBe(undefined);
  });

  it('should use prefix with key', async () => {
    const prefix = '@test';
    const key = faker.string.alphanumeric(5);
    const sut = makeSut({ prefix });

    await sut.setItem(key, { value: faker.word.sample(), number: 100 });
    await sut.getItem(key);

    expect(localStorage.getItem).toHaveBeenCalledWith(`${prefix}:${key}`);
  });

  it('should throws InvalidSecretKeyError if secret key is invalid', async () => {
    try {
      makeSut({ secretKey: faker.string.alphanumeric(8) });
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidSecretKeyError);
    }
  });

  it('should encrypt value and return encrypted value', async () => {
    const sut = makeSut();
    const value = {
      name: faker.word.sample(),
      id: faker.string.uuid(),
    };
    const result = await sut.encryptValue(value);

    expect(result).not.toEqual(value);
  });

  it('should encrypt value and return encrypted value with doNotParseValues option', async () => {
    const sut = makeSut({ doNotParseValues: true });
    const value = {
      name: faker.word.sample(),
      id: faker.string.uuid(),
    };
    const stringfyValue = JSON.stringify(value);
    const result = await sut.encryptValue(stringfyValue);

    expect(result).not.toEqual(stringfyValue);
  });

  it('should decrypt value and return decrypted value', async () => {
    const sut = makeSut();
    const value = {
      name: faker.word.sample(),
      id: faker.string.uuid(),
    };
    const encryptedValue = await sut.encryptValue(value);
    const decryptedValue = await sut.decryptValue<typeof value>(encryptedValue);

    expect(decryptedValue).toEqual(value);
  });

  it('should decrypt value and return decrypted value with doNotParseValues option', async () => {
    const sut = makeSut({ doNotParseValues: true });
    const value = {
      name: faker.word.sample(),
      id: faker.string.nanoid(),
    };
    const stringfyValue = JSON.stringify(value);
    const encryptedValue = await sut.encryptValue(stringfyValue);
    const decryptedValue = await sut.decryptValue<typeof value>(encryptedValue);

    expect(decryptedValue).toEqual(stringfyValue);
  });

  it('should test encryptStorage without options', async () => {
    const sut = makeSut({ noOptions: true });
    const key = faker.string.alphanumeric(5);

    await sut.getItem(key);

    expect(localStorage.getItem).toHaveBeenCalledWith(key);
  });

  it('should test AES-CBC algorithm', async () => {
    const sut = makeSut({ encAlgorithm: 'AES-CBC' });
    const key = faker.string.alphanumeric(5);
    const value = faker.word.sample();

    await sut.setItem(key, value);
    await sut.getItem(key);

    expect(localStorage.setItem).toHaveBeenCalled();
    expect(localStorage.getItem).toHaveBeenCalledWith(key);
  });

  it('should test AES-CTR algorithm', async () => {
    const sut = makeSut({ encAlgorithm: 'AES-CTR' });
    const key = faker.string.alphanumeric(5);
    const value = faker.word.sample();

    await sut.setItem(key, value);
    await sut.getItem(key);

    expect(localStorage.setItem).toHaveBeenCalled();
    expect(localStorage.getItem).toHaveBeenCalledWith(key);
  });

  it('should test AES-GCM algorithm', async () => {
    const sut = makeSut({ encAlgorithm: 'AES-GCM' });
    const key = faker.string.alphanumeric(5);
    const value = faker.word.sample();

    await sut.setItem(key, value);
    await sut.getItem(key);

    expect(localStorage.setItem).toHaveBeenCalled();
    expect(localStorage.getItem).toHaveBeenCalledWith(key);
  });

  it('should be hash any string with SHA256 algorithm', async () => {
    const sut = makeSut();
    const value = faker.word.sample(3);

    const result = await sut.hash(value);

    expect(result).not.toEqual(value);
  });
});
