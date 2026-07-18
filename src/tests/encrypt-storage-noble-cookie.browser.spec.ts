import { fakerPT_BR as faker } from '@faker-js/faker';

import { EncryptStorageNoble } from '@/classes';
import { IsNotBrowserEnvironmentError } from '@/errors';

import { makeSutFactory } from './test-utils';

import type { CookieOptions, NotifyHandlerParams } from '@/@types';
import type { Mock } from 'vite-plus/test';

let defaultMockedSut: EncryptStorageNoble | null = null;

const mockNotify = {
  mockedFn: vi.fn().mockImplementation((params: NotifyHandlerParams) => {
    return params;
  }),
};

let makeSut = makeSutFactory<EncryptStorageNoble | null, EncryptStorageNoble>(
  'noble',
  defaultMockedSut,
  mockNotify.mockedFn,
);

let cookieSetSpy: Mock<(arg: string) => void>;
let cookieGetSpy: Mock<() => string | undefined>;

describe('EncryptStorageNoble cookie 🍪', () => {
  beforeAll(() => {
    defaultMockedSut = makeSut();
    makeSut = makeSutFactory('noble', defaultMockedSut, mockNotify.mockedFn);
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

  it('should enshure cookie.set throws IsNotBrowserEnvironmentError when document.cookie is undefined', () => {
    const sut = makeSut();
    const key = faker.string.alphanumeric(5);
    const value = { value: faker.word.sample() };

    (document.cookie as any) = undefined;

    expect(() => sut.cookie.set(key, value)).toThrow(
      IsNotBrowserEnvironmentError,
    );
  });

  it('should enshure cookie.get throws IsNotBrowserEnvironmentError when document.cookie is undefined', () => {
    const sut = makeSut();
    const key = faker.string.alphanumeric(5);

    (document.cookie as any) = undefined;

    expect(() => sut.cookie.get(key)).toThrow(IsNotBrowserEnvironmentError);
  });

  it('should enshure cookie.remove throws IsNotBrowserEnvironmentError when document.cookie is undefined', () => {
    const sut = makeSut();
    const key = faker.string.alphanumeric(5);

    (document.cookie as any) = undefined;

    expect(() => sut.cookie.remove(key)).toThrow(IsNotBrowserEnvironmentError);
  });

  it('should enshure cookie.remove been called', () => {
    const sut = makeSut();
    const key = faker.string.alphanumeric(5);
    const value = { value: faker.word.sample() };
    const spy = vi.spyOn(mockNotify, 'mockedFn');

    sut.cookie.set(key, value);
    sut.cookie.remove(key);
    const result = sut.cookie.get(key);

    expect(result).toEqual('');
    expect(spy).toHaveBeenCalledWith({
      value: undefined,
      key,
      type: 'remove:cookie',
    });
  });

  it('should enshure cookie.remove been called without notifyHandler', () => {
    const sut = makeSut({ noNotifyHandler: true });
    const key = faker.string.alphanumeric(5);
    const value = { value: faker.word.sample() };

    sut.cookie.set(key, value);
    sut.cookie.remove(key);
    const result = sut.cookie.get(key);

    expect(result).toEqual('');
  });

  it('should enshure cookie.set been called with correct key and params', () => {
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

    sut.cookie.set(key, value, params);

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

  it('should enshure cookie.set been called with correct key and params without notifyHandler', () => {
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

    sut.cookie.set(key, value, params);

    expect(document.cookie).toContain(key);
    expect(document.cookie).toContain(`path=${path}`);
    expect(document.cookie).toContain(`expires=${date.toUTCString()}`);
    expect(document.cookie).toContain(`secure`);
    expect(document.cookie).toContain(`domain=${domain}`);
    expect(document.cookie).toContain(`samesite=${sameSite}`);
  });

  it('should enshure cookie.set been called with expires in number', () => {
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

    sut.cookie.set(key, value, params);
    sut.cookie.get(key);

    expect(document.cookie).toContain(key);
    expect(spy).toHaveBeenCalledWith({
      value: undefined,
      key,
      type: 'set:cookie',
    });
  });

  it('should calls cookie with correct key', () => {
    const sut = makeSut();
    const key = faker.string.alphanumeric(5);
    const value = faker.word.sample();
    sut.cookie.set(key, value);

    const spy = vi.spyOn(mockNotify, 'mockedFn');

    sut.cookie.get<string>(key);

    expect(document.cookie).toContain(key);
    expect(spy).toHaveBeenCalledWith({
      value: undefined,
      key,
      type: 'get:cookie',
    });
  });

  it('should cookie.get returns correct decrypted value', () => {
    const sut = makeSut();
    const key = faker.string.alphanumeric(5);
    const value = { value: faker.word.sample() };

    sut.cookie.set(key, value);
    const storagedDecrypetdValue = sut.cookie.get(key);

    expect(storagedDecrypetdValue).toEqual(value);
  });

  it('should cookie.get returns correct decrypted value without notifyHandler', () => {
    const sut = makeSut({ noNotifyHandler: true });
    const key = faker.string.alphanumeric(5);
    const value = { value: faker.word.sample() };

    sut.cookie.set(key, value);
    const storagedDecrypetdValue = sut.cookie.get(key);

    expect(storagedDecrypetdValue).toEqual(value);
  });

  it('should cookie.get returns null', () => {
    const sut = makeSut();
    const key = faker.string.alphanumeric(5);

    const result = sut.cookie.get(key);

    expect(result).toEqual(null);
  });
});
