import { fakerPT_BR as faker } from '@faker-js/faker';
import { MockInstance } from 'vitest';

import { clearCookies } from '@/utils';
import { makeSut } from '@/utils/test-utils';

let cookieSetSpy: MockInstance;
let cookieGetSpy: MockInstance;

let windowSpy: MockInstance;

const oldWindow: Window & typeof globalThis = { ...window };

describe('EncryptStorage: window is not defined behavior', () => {
  beforeAll(() => {
    cookieSetSpy = vitest.spyOn(document, 'cookie', 'set');
    cookieSetSpy?.mockImplementation(() => undefined);
    cookieGetSpy = vitest.spyOn(document, 'cookie', 'get');
    cookieGetSpy?.mockImplementation(() => undefined);
    windowSpy = vitest.spyOn(window, 'window', 'get');
    windowSpy?.mockImplementation(() => oldWindow);
  });

  beforeEach(() => {
    clearCookies();
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  afterEach(() => {
    localStorage.clear();
    vitest.clearAllMocks();
    windowSpy?.mockImplementation(() => oldWindow);
  });

  afterAll(() => {
    vitest.clearAllMocks();
    windowSpy?.mockImplementation(() => oldWindow);
  });

  it('should encryptStorage.length returns 0 on window is indefined', () => {
    const encryptStorage = makeSut();

    windowSpy?.mockImplementation(() => undefined);

    const result = encryptStorage.length;
    expect(result).toEqual(0);
  });

  it('should encryptStorage.clear not have been called on window is indefined', () => {
    const encryptStorage = makeSut();

    windowSpy?.mockImplementation(() => undefined);

    encryptStorage.clear();
    expect(localStorage.clear).not.toHaveBeenCalled();
  });

  it('should encryptStorage.key not have been called on window is indefined', () => {
    const encryptStorage = makeSut();

    windowSpy?.mockImplementation(() => undefined);

    const result = encryptStorage.key(1);
    expect(localStorage.key).not.toHaveBeenCalled();
    expect(result).toEqual(null);
  });

  it('should encryptStorage.setItem not have been called on window is indefined', () => {
    const encryptStorage = makeSut();

    windowSpy?.mockImplementation(() => undefined);

    encryptStorage.setItem(faker.word.words(1), faker.word.words(1));
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('should encryptStorage.setMultipleItems not have been called on window is indefined', () => {
    const encryptStorage = makeSut();

    windowSpy?.mockImplementation(() => undefined);

    encryptStorage.setMultipleItems([
      [faker.word.words(1), faker.word.words(1)],
    ]);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('should encryptStorage.getItem not have been called on window is indefined', () => {
    const encryptStorage = makeSut();

    windowSpy?.mockImplementation(() => undefined);

    encryptStorage.getItem(faker.word.words(1));
    expect(localStorage.getItem).not.toHaveBeenCalled();
  });

  it('should encryptStorage.getMultipleItems not have been called on window is indefined', () => {
    const encryptStorage = makeSut();

    windowSpy?.mockImplementation(() => undefined);

    encryptStorage.getMultipleItems([faker.word.words(1)]);
    expect(localStorage.getItem).not.toHaveBeenCalled();
  });

  it('should encryptStorage.getItemFromPattern not have been called on window is indefined', () => {
    const encryptStorage = makeSut();

    windowSpy?.mockImplementation(() => undefined);

    encryptStorage.getItemFromPattern(faker.string.alphanumeric(10));
    expect(localStorage.getItem).not.toHaveBeenCalled();
  });

  it('should encryptStorage.removeItem not have been called on window is indefined', () => {
    const encryptStorage = makeSut();

    windowSpy?.mockImplementation(() => undefined);

    encryptStorage.removeItem(faker.word.words(1));
    expect(localStorage.removeItem).not.toHaveBeenCalled();
  });

  it('should encryptStorage.removeMultipleItems not have been called on window is indefined', () => {
    const encryptStorage = makeSut();

    windowSpy?.mockImplementation(() => undefined);

    encryptStorage.removeMultipleItems([faker.word.words(1)]);
    expect(localStorage.removeItem).not.toHaveBeenCalled();
  });

  it('should encryptStorage.removeItemFromPattern not have been called on window is indefined', () => {
    const encryptStorage = makeSut();

    windowSpy?.mockImplementation(() => undefined);

    encryptStorage.removeItemFromPattern(faker.string.alphanumeric(10));
    expect(localStorage.removeItem).not.toHaveBeenCalled();
  });
});
