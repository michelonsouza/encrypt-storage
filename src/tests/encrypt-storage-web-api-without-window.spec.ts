/**
 * @vitest-environment node
 */
import 'vitest-localstorage-mock';
import { fakerPT_BR as faker } from '@faker-js/faker';

import { EncryptStorageWebApi } from '@/classes';

import type { NotifyHandlerParams, AsyncEncryptStorageOptions } from '@/@types';

interface makeSutParams extends Omit<AsyncEncryptStorageOptions, 'api'> {
  secretKey?: string;
  noOptions?: boolean;
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
    doNotParseValues = false,
    notifyHandler = mockNotify.mockedFn,
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
  return new EncryptStorageWebApi(secretKey, options);
};

function getWindow(): (Window & typeof globalThis) | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window;
}

let safeWindow = getWindow();

describe('EncryptStorageWebApi without window 🖥️', () => {
  beforeEach(() => {
    safeWindow = getWindow();
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should enshure localStorage not been called', async () => {
    const sut = makeSut();
    const key = faker.string.alphanumeric(5);

    await sut.setItem(key, faker.word.sample());

    expect(safeWindow?.localStorage?.setItem).toBe(undefined);
  });

  it('should enshure sessionStorage not been called', async () => {
    const sut = makeSut({ storageType: 'sessionStorage' });
    const key = faker.string.alphanumeric(5);

    await sut.setItem(key, faker.word.sample());

    expect(safeWindow?.sessionStorage?.setItem).toBe(undefined);
  });

  it('should calls localStorage.getItem not been called', async () => {
    const sut = makeSut();
    const key = faker.string.alphanumeric(5);

    await sut.getItem(key);

    expect(safeWindow?.localStorage?.getItem).toBe(undefined);
  });

  it('should calls localStorage.removeItem not been called', () => {
    const sut = makeSut();
    const key = faker.string.alphanumeric(5);

    sut.removeItem(key);

    expect(safeWindow?.localStorage?.removeItem).toBe(undefined);
  });

  it('should calls localStorage.getItem not been called when safeStorage.getItemFromPattern is called', async () => {
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

    await sut.getItemFromPattern(pattern);

    expect(safeWindow?.localStorage?.getItem).toBe(undefined);
  });

  it('should calls localStorage.length not been called', async () => {
    const sut = makeSut();
    const key1 = faker.word.sample();
    const key2 = faker.word.sample();
    const anyValue = faker.word.sample();

    await sut.setItem(key1, anyValue);
    await sut.setItem(key2, anyValue);
    let safeStorageLength = sut.length;

    sut.clear();

    safeStorageLength = sut.length;

    expect(safeWindow?.localStorage?.length).toBe(undefined);
    expect(safeStorageLength).toBe(0);
  });

  it('should calls localStorage.removeItem not been called when safeStorage.removeItemFromPattern is called', async () => {
    const sut = makeSut();
    const pattern = faker.string.alphanumeric(8);
    const userKey = `${pattern}:user`;
    const itemKey = `${pattern}:item`;

    await sut.setItem(userKey, { id: 123 });
    await sut.setItem(itemKey, { id: 456 });

    sut.removeItemFromPattern(pattern);

    expect(safeWindow?.localStorage?.removeItem).toBe(undefined);
  });

  it('should calls localStorage.removeItem is undefined whensafeStorage.removeItemFromPattern is called', async () => {
    const sut = makeSut();
    const pattern = faker.string.alphanumeric(8);
    const userKey = `${pattern}:user`;
    const itemKey = `${pattern}:item`;

    await sut.setItem(userKey, { id: 123 });
    await sut.setItem(itemKey, { id: 456 });

    sut.removeItemFromPattern(pattern);

    expect(safeWindow?.localStorage?.getItem).toBe(undefined);
  });

  it('should localStorage.key is undefined', async () => {
    const sut = makeSut();
    const key1 = faker.word.sample();
    const key2 = faker.word.sample();

    await sut.setItem(key1, 'any_value');
    await sut.setItem(key2, 'any_value');

    expect(sut.key(0)).toBe(null);
    expect(sut.key(1)).toBe(null);
    expect(sut.key(2)).toBeFalsy();
  });
});
