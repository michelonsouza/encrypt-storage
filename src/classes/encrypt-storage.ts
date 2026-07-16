import { EncryptStorageCryptoJs } from './encrypt-storage-crypto-js';
import { EncryptStorageWebApi } from './encrypt-storage-web-api';

import type {
  EncryptStorageOptions,
  SyncEncryptStorageOptions,
  AsyncEncryptStorageOptions,
} from '@/@types';

export class EncryptStorage {
  static storage: EncryptStorageCryptoJs | EncryptStorageWebApi;
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
    let storage: EncryptStorageCryptoJs | EncryptStorageWebApi;
    if (options.engine === 'crypto-js') {
      storage = new EncryptStorageCryptoJs(secretKey, options);
    } else {
      storage = new EncryptStorageWebApi(secretKey, options);
    }

    this.storage = storage;

    return storage;
  }
}
