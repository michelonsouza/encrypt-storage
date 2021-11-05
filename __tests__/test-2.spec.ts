/**
 * @jest-environment node
 */
/* eslint-disable import/no-extraneous-dependencies */
import faker from 'faker';

import { makeSut } from '../src/experiments/test-1';

describe('EncryptStorageNoWindow', () => {
  it('should test when window object is undefined (SSR)', () => {
    const prefix = '@test';
    const key = faker.random.word();
    const pattern = faker.random.word();
    const index = faker.datatype.number();
    const safeStorage = makeSut({ prefix });
    const safeStorage2 = makeSut();

    safeStorage.setItem(key, { value: faker.random.word(), number: 100 });
    safeStorage2.setItem(key, { value: faker.random.word(), number: 100 });
    safeStorage.getItem(key);
    safeStorage2.getItem(key);
    safeStorage.getItemFromPattern(pattern);
    safeStorage2.getItemFromPattern(pattern);
    safeStorage.removeItemFromPattern(pattern);
    safeStorage.removeItemFromPattern(key);
    safeStorage2.removeItemFromPattern(pattern);
    safeStorage.removeItem(key);
    safeStorage2.removeItem(key);
    safeStorage.key(index);
    safeStorage2.key(index);
    safeStorage.clear();
    safeStorage2.clear();

    safeStorage.length;
    safeStorage2.length;

    expect(global.window).toBeFalsy();
  });
});
