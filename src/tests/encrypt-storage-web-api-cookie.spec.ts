import { fakerPT_BR as faker } from '@faker-js/faker';

import { EncryptStorageWebApi } from '@/classes';

import type {
  CookieOptions,
  NotifyHandlerParams,
  AsyncEncryptStorageOptions,
} from '@/@types';
import type { Mock } from 'vite-plus/test';

interface makeSutParams extends Omit<AsyncEncryptStorageOptions, 'engine'> {
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
    ? { engine: 'web-crypto' }
    : {
        prefix,
        storageType,
        encAlgorithm,
        notifyHandler,
        doNotParseValues,
        engine: 'web-crypto',
        stateManagementUse,
      };
  return new EncryptStorageWebApi(secretKey, options);
};

let cookieSetSpy: Mock<(arg: string) => void>;
let cookieGetSpy: Mock<() => string | undefined>;

describe('EncryptStorageWebApi cookie 🍪', () => {
  beforeAll(() => {
    cookieSetSpy = vi.spyOn(document, 'cookie', 'set');
    cookieSetSpy?.mockImplementation(() => undefined);
    cookieGetSpy = vi.spyOn(document, 'cookie', 'get');
    cookieGetSpy?.mockImplementation(() => undefined);
  });
  beforeEach(() => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });
  afterAll(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should enshure cookie.set not been called', async () => {
    const sut = makeSut();
    const key = faker.string.alphanumeric(5);
    const value = { value: faker.word.sample() };

    (document.cookie as any) = undefined;

    await sut.cookie.set(key, value);
    expect(document.cookie).toEqual(undefined);
  });

  it('should enshure cookie.get not been called', async () => {
    const sut = makeSut();
    const key = faker.string.alphanumeric(5);
    const value = { value: faker.word.sample() };

    await sut.cookie.set(key, value);

    (document.cookie as any) = undefined;

    sut.cookie.get(key);

    expect(document.cookie).toEqual(undefined);
  });

  it('should enshure cookie.remove not been called when document.cookie is undefined', async () => {
    const sut = makeSut();
    const key = faker.string.alphanumeric(5);
    const value = { value: faker.word.sample() };

    await sut.cookie.set(key, value);

    (document.cookie as any) = undefined;

    sut.cookie.remove(key);

    expect(document.cookie).toEqual(undefined);
  });

  it('should enshure cookie.remove been called', async () => {
    const sut = makeSut();
    const key = faker.string.alphanumeric(5);
    const value = { value: faker.word.sample() };
    const spy = vi.spyOn(mockNotify, 'mockedFn');

    await sut.cookie.set(key, value);
    sut.cookie.remove(key);

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 50);
    });

    const result = await sut.cookie.get(key);

    expect(result).toEqual('');
    expect(spy).toHaveBeenCalledWith({
      value: undefined,
      key,
      type: 'remove:cookie',
    });
  });

  it('should enshure cookie.remove been called without notifyHandler', async () => {
    const sut = makeSut({ noNotifyHandler: true });
    const key = faker.string.alphanumeric(5);
    const value = { value: faker.word.sample() };

    await sut.cookie.set(key, value);
    sut.cookie.remove(key);

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 50);
    });

    const result = await sut.cookie.get(key);

    expect(result).toEqual('');
  });

  it('should enshure cookie.set been called with correct key and params', async () => {
    const sut = makeSut();
    const key = faker.string.alphanumeric(10);
    const value = faker.word.sample();
    const spy = vi.spyOn(mockNotify, 'mockedFn');
    const date = faker.date.future({ years: 1 });
    const domain = faker.internet.domainName();
    const path = '/';
    const sameSite = faker.helpers.arrayElement<CookieOptions['sameSite']>([
      'strict',
      'lax',
      'none',
    ]);

    const params = {
      expires: date,
      path,
      domain,
      secure: true,
      sameSite,
    };

    await sut.cookie.set(key, value, params);

    expect(document.cookie).toContain(key);
    expect(document.cookie).toContain(`path=${path}`);
    expect(document.cookie).toContain(`expires=${date.toUTCString()}`);
    expect(document.cookie).toContain(`secure`);
    expect(document.cookie).toContain(`domain=${domain}`);
    expect(document.cookie).toContain(`samesite=${sameSite}`);
    expect(spy).toHaveBeenCalledWith({
      value: undefined,
      key,
      type: 'set:cookie',
    });
  });

  it('should enshure cookie.set been called with correct key and params without notifyHandler', async () => {
    const sut = makeSut({ noNotifyHandler: true });
    const key = faker.string.alphanumeric(10);
    const value = faker.word.sample();
    const date = faker.date.future({ years: 1 });
    const domain = faker.internet.domainName();
    const path = '/';
    const sameSite = faker.helpers.arrayElement<CookieOptions['sameSite']>([
      'strict',
      'lax',
      'none',
    ]);

    const params = {
      expires: date,
      path,
      domain,
      secure: true,
      sameSite,
    };

    await sut.cookie.set(key, value, params);

    expect(document.cookie).toContain(key);
    expect(document.cookie).toContain(`path=${path}`);
    expect(document.cookie).toContain(`expires=${date.toUTCString()}`);
    expect(document.cookie).toContain(`secure`);
    expect(document.cookie).toContain(`domain=${domain}`);
    expect(document.cookie).toContain(`samesite=${sameSite}`);
  });

  it('should enshure cookie.set been called with expires in number', async () => {
    const sut = makeSut({
      doNotParseValues: true,
    });
    const key = faker.string.alphanumeric(10);
    const value = faker.word.sample();
    const spy = vi.spyOn(mockNotify, 'mockedFn');
    const date = faker.number.int(50);
    const domain = faker.internet.domainName();

    const params = {
      expires: date,
      domain,
    };

    await sut.cookie.set(key, value, params);
    await sut.cookie.get(key);

    expect(document.cookie).toContain(key);
    expect(spy).toHaveBeenCalledWith({
      value: undefined,
      key,
      type: 'set:cookie',
    });
  });

  it('should calls cookie with correct key', async () => {
    const sut = makeSut();
    const key = faker.string.alphanumeric(5);
    const value = faker.word.sample();
    sut.cookie.set(key, value);

    const spy = vi.spyOn(mockNotify, 'mockedFn');

    await sut.cookie.get<string>(key);

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 50);
    });

    expect(document.cookie).toContain(key);
    expect(spy).toHaveBeenCalledWith({
      value: undefined,
      key,
      type: 'get:cookie',
    });
  });

  it('should cookie.get returns correct decrypted value', async () => {
    const sut = makeSut();
    const key = faker.string.alphanumeric(5);
    const value = { value: faker.word.sample() };

    await sut.cookie.set(key, value);
    const storagedDecrypetdValue = await sut.cookie.get(key);

    expect(storagedDecrypetdValue).toEqual(value);
  });

  it('should cookie.get returns correct decrypted value without notifyHandler', async () => {
    const sut = makeSut({ noNotifyHandler: true });
    const key = faker.string.alphanumeric(5);
    const value = { value: faker.word.sample() };

    await sut.cookie.set(key, value);
    const storagedDecrypetdValue = await sut.cookie.get(key);

    expect(storagedDecrypetdValue).toEqual(value);
  });

  it('should cookie.get returns null', async () => {
    const sut = makeSut();
    const key = faker.string.alphanumeric(5);

    const result = await sut.cookie.get(key);

    expect(result).toEqual(null);
  });
});
