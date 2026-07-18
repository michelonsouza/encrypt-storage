import { EncryptStorage } from './encrypt-storage';

import type { EncryptStorageNoble } from './encrypt-storage-noble';
import type { EncryptStorageWebApi } from './encrypt-storage-web-api';
import type {
  EncryptStorageOptions,
  GetFromPatternOptions,
  RemoveFromPatternOptions,
} from '@/@types';

export class AsyncEncryptStorage {
  #encryptStorage: EncryptStorageNoble | EncryptStorageWebApi;

  constructor(secretKey: string, options: EncryptStorageOptions) {
    this.#encryptStorage = EncryptStorage.create(secretKey, options as any);
  }

  public get length(): Promise<number> {
    return Promise.resolve(this.#encryptStorage.length);
  }

  public async setItem(
    key: string,
    value: any,
    dotNotEncrypt?: boolean,
  ): Promise<void> {
    return await this.#encryptStorage.setItem(key, value, dotNotEncrypt);
  }

  public async getItem<T = any>(
    key: string,
    doNotDecrypt?: boolean,
  ): Promise<T | undefined> {
    const storageValue = await this.#encryptStorage.getItem<T>(
      key,
      doNotDecrypt,
    );
    return storageValue;
  }

  public async removeItem(key: string): Promise<void> {
    return new Promise((resolve) => {
      resolve(this.#encryptStorage.removeItem(key));
    });
  }

  public async getItemFromPattern(
    pattern: string,
    options?: GetFromPatternOptions,
  ): Promise<Record<string, any> | undefined> {
    const storageValues = await this.#encryptStorage.getItemFromPattern(
      pattern,
      options,
    );

    return storageValues;
  }

  public async removeItemFromPattern(
    pattern: string,
    options?: RemoveFromPatternOptions,
  ): Promise<void> {
    return new Promise((resolve) => {
      resolve(this.#encryptStorage.removeItemFromPattern(pattern, options));
    });
  }

  public async clear(): Promise<void> {
    return new Promise((resolve) => {
      resolve(this.#encryptStorage.clear());
    });
  }

  public async key(index: number): Promise<string | null> {
    return new Promise((resolve) => {
      resolve(this.#encryptStorage.key(index));
    });
  }

  public async encryptValue(value: any): Promise<string> {
    const encryptedValue = await this.#encryptStorage.encryptValue(value);

    return encryptedValue;
  }

  public async decryptValue<T = any>(value: string): Promise<T> {
    const decryptedValue = (await this.#encryptStorage.decryptValue<T>(
      value,
    )) as T;

    return decryptedValue;
  }

  public async hash(value: string): Promise<string> {
    return await this.#encryptStorage.hash(value);
  }
}

/* v8 ignore start -- @preserve */
if (typeof window !== 'undefined') {
  (window as any).AsyncEncryptStorage = AsyncEncryptStorage;
}

if (typeof window !== 'undefined' && window?.globalThis) {
  // oxlint-disable-next-line no-unsafe-optional-chaining
  (window?.globalThis as any).AsyncEncryptStorage = AsyncEncryptStorage;
}
/* v8 ignore end -- @preserve */
