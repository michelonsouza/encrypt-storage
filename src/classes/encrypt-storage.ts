import { EncryptStorageCryptoJs } from './encrypt-storage-crypto-js';
import { EncryptStorageWebApi } from './encrypt-storage-web-api';

import type {
  EncryptStorageOptions,
  SyncEncryptStorageOptions,
  AsyncEncryptStorageOptions,
} from '@/@types';

export class EncryptStorage {
  static create(
    secretKey: string,
    options: SyncEncryptStorageOptions,
  ): EncryptStorageCryptoJs;
  static create(
    secretKey: string,
    options: AsyncEncryptStorageOptions,
  ): EncryptStorageWebApi;

  /**
   * @description Create encrypt storage instance based on options
   * @param {string} secretKey
   * @param {EncryptStorageOptions} options
   * @returns {EncryptStorageCryptoJs | EncryptStorageWebApi} `EncryptStorageCryptoJs | EncryptStorageWebApi`
   */
  static create(
    secretKey: string,
    options: EncryptStorageOptions,
  ): EncryptStorageCryptoJs | EncryptStorageWebApi {
    return options.engine === 'crypto-js'
      ? new EncryptStorageCryptoJs(secretKey, options)
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
