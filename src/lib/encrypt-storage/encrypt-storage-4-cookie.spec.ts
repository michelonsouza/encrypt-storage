import { fakerPT_BR as faker } from '@faker-js/faker';

import { makeSut, mockNotify } from '@/utils/test-utils';

/**
 * @vitest-environment jsdom
 */

describe('EncryptStorage: cookie', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  it('should cookie.length returns correect value', () => {
    const prefix = faker.word.words(1);
    const encryptStorage = makeSut({
      storageType: 'cookies',
      prefix,
    });
    const key = faker.word.words(1);
    const value = {
      [faker.word.words(1)]: faker.word.words(5),
    };

    const options = {
      expires: new Date(
        Date.now() +
          faker.number.int({
            min: 86400,
            max: 86400 * 2,
          }),
      ),
    };

    encryptStorage.setItem(key, value, options);

    const cookieResult = encryptStorage.getItem(key);

    const result = encryptStorage.length;

    expect(result).toEqual(1);
    expect(cookieResult).toEqual(value);
  });

  it('should cookie.clear to have been called', () => {
    const spy = vitest.spyOn(mockNotify, 'mockedFn');
    const encryptStorage = makeSut({
      storageType: 'cookies',
      notifyHandler: mockNotify.mockedFn,
    });

    encryptStorage.clear();

    expect(spy).toHaveBeenCalledWith({
      type: 'clear:cookie',
    });
  });

  it('should cookie.key to have been called', () => {
    const spy = vitest.spyOn(mockNotify, 'mockedFn');
    const encryptStorage = makeSut({
      storageType: 'cookies',
      notifyHandler: mockNotify.mockedFn,
    });

    const index = faker.number.int({
      min: 1,
      max: 10,
    });

    encryptStorage.key(index);

    expect(spy).toHaveBeenCalledWith({
      type: 'key:cookie',
      index,
      value: null,
    });
  });

  it('should cookie.multipleItems to have been called', () => {
    const spy = vitest.spyOn(mockNotify, 'mockedFn');
    const encryptStorage = makeSut({
      storageType: 'cookies',
      notifyHandler: mockNotify.mockedFn,
    });

    const value1: [string, string] = [faker.word.words(1), faker.word.words(1)];
    const value2: [string, string] = [faker.word.words(1), faker.word.words(1)];
    const keys = [value1[0], value2[0]];
    const value = [value1[1], value2[1]];

    encryptStorage.setMultipleItems([value1, value2]);

    expect(spy).toHaveBeenCalledWith({
      type: 'setMultiple:cookie',
      value,
      key: keys,
    });
  });

  it('should cookie.getMultipleItems to have been called', () => {
    const spy = vitest.spyOn(mockNotify, 'mockedFn');
    const encryptStorage = makeSut({
      storageType: 'cookies',
      notifyHandler: mockNotify.mockedFn,
    });

    const keys = [faker.word.words(1), faker.word.words(1)];
    const result = encryptStorage.getMultipleItems(keys);

    expect(spy).toHaveBeenCalledWith({
      type: 'getMultiple:cookie',
      value: result,
      key: keys,
    });
  });

  it('should cookie.getItemFromPattern to have been called', () => {
    const spy = vitest.spyOn(mockNotify, 'mockedFn');
    const encryptStorage = makeSut({
      storageType: 'cookies',
      notifyHandler: mockNotify.mockedFn,
    });

    const pattern = faker.string.alphanumeric(8);
    const result = encryptStorage.getItemFromPattern(pattern);

    expect(spy).toHaveBeenCalledWith({
      type: 'getItemFromPattern:cookie',
      value: result,
      key: pattern,
    });
  });

  it('should cookie.getItemFromPattern to have been called with value', () => {
    const spy = vitest.spyOn(mockNotify, 'mockedFn');
    const encryptStorage = makeSut({
      storageType: 'cookies',
      notifyHandler: mockNotify.mockedFn,
    });

    const pattern = faker.string.alphanumeric(8);
    const key = `${pattern}:user`;
    encryptStorage.setItem(key, faker.word.words(1));
    const result = encryptStorage.getItemFromPattern(pattern, {
      multiple: false,
    });

    expect(spy).toHaveBeenCalledWith({
      type: 'getItemFromPattern:cookie',
      value: result,
      key,
    });
  });

  it('should cookie.getItemFromPattern to have been called with multiple values', () => {
    const spy = vitest.spyOn(mockNotify, 'mockedFn');
    const encryptStorage = makeSut({
      storageType: 'cookies',
      notifyHandler: mockNotify.mockedFn,
    });

    const pattern = faker.string.alphanumeric(8);
    const key = `${pattern}:user`;
    encryptStorage.setItem(key, faker.word.words(1));
    const result = encryptStorage.getItemFromPattern(pattern);

    expect(spy).toHaveBeenCalledWith({
      type: 'getItemFromPattern:cookie',
      value: result,
      key: [key],
    });
  });

  it('should cookie.removeItemFromPattern to have been called', () => {
    const spy = vitest.spyOn(mockNotify, 'mockedFn');
    const encryptStorage = makeSut({
      storageType: 'cookies',
      notifyHandler: mockNotify.mockedFn,
    });

    const pattern = faker.string.alphanumeric(8);
    const key = `${pattern}:user`;
    encryptStorage.setItem(key, faker.word.words(1));
    encryptStorage.removeItemFromPattern(pattern);

    expect(spy).toHaveBeenCalledWith({
      type: 'removeMultiple:cookie',
      key: [key],
    });
  });

  it('should cookie.removeItem to have been called', () => {
    const spy = vitest.spyOn(mockNotify, 'mockedFn');
    const encryptStorage = makeSut({
      storageType: 'cookies',
      notifyHandler: mockNotify.mockedFn,
    });

    const key = faker.word.words(1);
    encryptStorage.setItem(key, faker.word.words(1));
    encryptStorage.removeItem(key);

    expect(spy).toHaveBeenCalledWith({
      type: 'remove:cookie',
      key,
    });
  });

  it('should cookie.removeMultipleItems to have been called', () => {
    const spy = vitest.spyOn(mockNotify, 'mockedFn');
    const encryptStorage = makeSut({
      storageType: 'cookies',
      notifyHandler: mockNotify.mockedFn,
    });

    const keys = [faker.word.words(1), faker.word.words(1)];
    encryptStorage.setItem(keys[0], faker.word.words(1));
    encryptStorage.setItem(keys[1], faker.word.words(1));
    encryptStorage.removeMultipleItems(keys);

    expect(spy).toHaveBeenCalledWith({
      type: 'removeMultiple:cookie',
      key: keys,
    });
  });
});
