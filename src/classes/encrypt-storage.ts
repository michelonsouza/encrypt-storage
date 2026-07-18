import { EncryptStorageNoble } from './encrypt-storage-noble';
import { EncryptStorageWebApi } from './encrypt-storage-web-api';

import type {
  EncryptStorageOptions,
  SyncEncryptStorageOptions,
  AsyncEncryptStorageOptions,
} from '@/@types';

export class EncryptStorage {
  /**
   * @description Create EncryptStorageNoble instance
   * @param {string} secretKey
   * @param {SyncEncryptStorageOptions} options
   * @returns {EncryptStorageNoble} `EncryptStorageNoble`
   */
  static create(
    secretKey: string,
    options: SyncEncryptStorageOptions,
  ): EncryptStorageNoble;

  /**
   * @description Create EncryptStorageWebApi instance
   * @param {string} secretKey
   * @param {AsyncEncryptStorageOptions} options
   * @returns {EncryptStorageWebApi} `EncryptStorageWebApi`
   */
  static create(
    secretKey: string,
    options: AsyncEncryptStorageOptions,
  ): EncryptStorageWebApi;

  /**
   * @description Create encrypt storage instance based on options
   * @param {string} secretKey
   * @param {EncryptStorageOptions} options
   * @returns {EncryptStorageWebApi | EncryptStorageNoble} `EncryptStorageWebApi | EncryptStorageNoble`
   */
  static create(
    secretKey: string,
    options: EncryptStorageOptions,
  ): EncryptStorageWebApi | EncryptStorageNoble {
    return options.engine === 'noble'
      ? // @ts-expect-error
        new EncryptStorageNoble(secretKey, options)
      : new EncryptStorageWebApi(secretKey, options);
  }
}

/* v8 ignore start -- @preserve */
if (typeof window !== 'undefined') {
  (window as any).EncryptStorage = EncryptStorage;
}

if (typeof window !== 'undefined' && window?.globalThis) {
  // oxlint-disable-next-line no-unsafe-optional-chaining
  (window?.globalThis as any).EncryptStorage = EncryptStorage;
}
/* v8 ignore end -- @preserve */
