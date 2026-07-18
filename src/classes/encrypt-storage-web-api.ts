import { InvalidSecretKeyError, IsNotBrowserEnvironmentError } from '@/errors';
import {
  hashAsyncSHA256,
  getAsyncEncryptation,
  SECRET_KEY_MIN_LENGTH,
  nullValueErrorHandler,
  undefinedValueErrorHandler,
} from '@/utils';

import { AsyncEncryptCookie } from './async-encrypt-cookie';

import type {
  NotifyHandler,
  CookieOptions,
  AsyncEncryptation,
  RemoveCookieOptions,
  AsyncCookieInterface,
  GetFromPatternOptions,
  EncryptAlgorithms,
  RemoveFromPatternOptions,
  AsyncEncryptStorageOptions,
  EncryptStorageCryptoWebApiInterface,
  NotifyHandlerParams,
  TTLStorageValue,
  SetTTLItemParams,
  AsyncEncryptStorageTTLInterface,
  TTLMetadata,
  RefreshTTLParams,
  StorageType,
} from '@/@types';

const secret = new globalThis.WeakMap();

export class EncryptStorageWebApi
  implements
    EncryptStorageCryptoWebApiInterface,
    AsyncEncryptStorageTTLInterface
{
  readonly #keys: Set<string> = new Set();

  // @ts-expect-error
  #encryptation: AsyncEncryptation;

  readonly #encAlgorithm: EncryptAlgorithms;

  readonly #stateManagementUse: boolean;

  readonly #doNotEncryptValues: boolean;

  readonly #doNotParseValues: boolean;

  readonly #notifyHandler: NotifyHandler | undefined;

  readonly #prefix: string;

  readonly #allowNull: boolean;

  readonly #allowUndefined: boolean;

  readonly #storageType: StorageType;

  #multiple = false;

  public readonly api = 'web-crypto' as const;

  public cookie: AsyncCookieInterface;

  /**
   * EncryptStorage provides a wrapper implementation of `localStorage` and `sessionStorage` for a better security solution in browser data store
   *
   * @param {string} secretKey - A secret to encrypt data must be contain min of 10 characters
   * @param {AsyncEncryptStorageOptions} options - Settings to set encryptData or select `sessionStorage` to browser storage
   */
  constructor(secretKey: string, options: AsyncEncryptStorageOptions) {
    if (secretKey.length < SECRET_KEY_MIN_LENGTH) {
      throw new InvalidSecretKeyError();
    }

    const {
      storageType = 'localStorage',
      prefix = '',
      stateManagementUse = false,
      encAlgorithm = 'AES-GCM',
      doNotEncryptValues = false,
      notifyHandler,
      doNotParseValues = false,
      validation = {
        strict: false,
        allowNull: true,
        allowUndefined: false,
      },
    } = options;

    secret.set(this, secretKey);

    this.#prefix = prefix;
    this.#notifyHandler = notifyHandler;
    this.#stateManagementUse = stateManagementUse;
    this.#doNotEncryptValues = doNotEncryptValues;
    this.#doNotParseValues = doNotParseValues;
    this.#encAlgorithm = encAlgorithm;
    this.#allowNull = validation?.strict
      ? false
      : (validation?.allowNull ?? true);
    this.#allowUndefined = validation?.strict
      ? false
      : (validation?.allowUndefined ?? false);
    this.#storageType = storageType;

    this.cookie = new AsyncEncryptCookie({
      decryptValue: (value) => this.decryptValue(value),
      encryptValue: (value) => this.encryptValue(value),
      getKey: (key) => this.#getKey(key),
      notifier: (params) => this.#notifier(params),
      doNotEncryptValues: this.#doNotEncryptValues,
      doNotParseValues: this.#doNotParseValues,
    });
  }

  get storage(): Storage {
    if (typeof window === 'undefined') {
      throw new IsNotBrowserEnvironmentError();
    }

    return window[this.#storageType];
  }

  async #init(encAlgorithm: EncryptAlgorithms) {
    this.#encryptation = await getAsyncEncryptation(
      encAlgorithm,
      secret.get(this),
    );
  }

  #getKey(key: string): string {
    return this.#prefix ? `${this.#prefix}:${key}` : key;
  }

  #notifier(params: NotifyHandlerParams, callback?: VoidFunction) {
    if (this.#notifyHandler) {
      this.#notifyHandler(params);
      callback?.();
    }
  }

  async #verifyEncryptation() {
    if (!this.#encryptation) {
      await this.#init(this.#encAlgorithm);
    }
  }

  #valueValidate<T = unknown>(value: T): T {
    let validatedValue = value;

    if (!this.#allowNull) {
      validatedValue = nullValueErrorHandler<T>(value);
    }

    if (!this.#allowUndefined) {
      validatedValue = undefinedValueErrorHandler<T>(value);
    }

    return validatedValue;
  }

  public get length() {
    const value = this.storage.length || 0;

    this.#notifier({
      type: 'length',
      value,
    });

    return value;
  }

  public async setItem(
    key: string,
    value: any,
    doNotEncrypt = false,
  ): Promise<void> {
    const validatedValue = this.#valueValidate(value);
    await this.#verifyEncryptation();
    const encryptValues = this.#doNotEncryptValues || doNotEncrypt;
    const storageKey = this.#getKey(key);
    let valueToString =
      typeof value === 'object'
        ? JSON.stringify(validatedValue)
        : String(validatedValue);

    if (this.#doNotParseValues) {
      valueToString = value;
    }

    const encryptedValue = encryptValues
      ? valueToString
      : await this.#encryptation.encrypt(valueToString);

    this.storage.setItem(storageKey, encryptedValue);

    if (!this.#multiple) {
      this.#notifier({
        type: 'set',
        key,
        value: valueToString,
      });
    }

    this.#keys.add(key);
  }

  public async setMultipleItems(
    param: [string, any][],
    doNotEncrypt?: boolean,
  ): Promise<void> {
    await this.#verifyEncryptation();
    this.#multiple = true;
    await Promise.all(
      param.map(([key, value]) => this.setItem(key, value, doNotEncrypt)),
    );

    const keys = param.map(([key]) => key);
    const values = param.map(([_, value]) =>
      typeof value === 'object' ? JSON.stringify(value) : String(value),
    );
    this.#notifier({
      type: 'setMultiple',
      key: keys,
      value: values,
    });

    this.#multiple = false;
  }

  public async getItem<DataType = any>(
    key: string,
    doNotDecrypt = false,
  ): Promise<DataType | undefined> {
    await this.#verifyEncryptation();
    const decryptValues = this.#doNotEncryptValues || doNotDecrypt;
    const storageKey = this.#getKey(key);
    const item = this.storage.getItem(storageKey);

    if (item) {
      const decryptedValue = decryptValues
        ? item
        : await this.#encryptation.decrypt(item);

      if (this.#stateManagementUse && !this.#multiple) {
        if (this.#notifyHandler) {
          this.#notifyHandler({
            type: 'get',
            key,
            value: decryptedValue,
          });
        }
        return decryptedValue as unknown as DataType;
      }

      try {
        const value = this.#doNotParseValues
          ? decryptedValue
          : JSON.parse(decryptedValue);

        if (!this.#multiple) {
          this.#notifier({
            type: 'get',
            key,
            value,
          });
        }

        return value as DataType;
      } catch {
        if (!this.#multiple) {
          this.#notifier({
            type: 'get',
            key,
            value: decryptedValue,
          });
        }
        return decryptedValue as unknown as DataType;
      }
    }

    if (!this.#multiple) {
      this.#notifier({
        type: 'get',
        key,
        value: undefined,
      });
    }

    return undefined;
  }

  public async getMultipleItems(
    keys: string[],
    doNotDecrypt?: boolean,
  ): Promise<Record<string, any>> {
    await this.#verifyEncryptation();
    this.#multiple = true;
    const values = await Promise.all(
      keys.map((key) => this.getItem(key, doNotDecrypt)),
    );
    const result = keys.reduce(
      (accumulator: Record<string, any>, key, index) => {
        accumulator[key] = values[index];

        return accumulator;
      },
      {},
    );

    this.#notifier({
      type: 'getMultiple',
      key: keys,
      value: result,
    });

    this.#multiple = false;

    return result;
  }

  public removeItem(key: string): void {
    const storageKey = this.#getKey(key);
    this.storage.removeItem(storageKey);

    if (!this.#multiple) {
      this.#notifier({
        type: 'remove',
        key,
      });
    }

    this.#keys.delete(key);
  }

  public removeMultipleItems(keys: string[]): void {
    this.#multiple = true;

    keys.forEach((key) => {
      this.removeItem(key);
    });

    this.#notifier({
      type: 'removeMultiple',
      key: keys,
    });

    this.#multiple = false;
  }

  public removeItemFromPattern(
    pattern: string,
    options: RemoveFromPatternOptions = {} as RemoveFromPatternOptions,
  ): void {
    const { exact = false } = options;
    const storageKeys = Object.keys(this.storage);
    const filteredKeys = storageKeys.filter((key) => {
      if (exact) {
        return key === this.#getKey(pattern);
      }

      if (this.#prefix) {
        return key.includes(pattern) && key.includes(this.#prefix);
      }

      return key.includes(pattern);
    });

    if (this.#notifyHandler) {
      const keys = filteredKeys.map((key) =>
        this.#prefix ? key.split(`${this.#prefix}:`)[1] : key,
      );
      this.#notifyHandler({
        type: 'remove',
        key: keys,
      });
    }

    filteredKeys.forEach((key) => {
      /* istanbul ignore next */
      this.storage.removeItem(key);
    });
  }

  public async getItemFromPattern(
    pattern: string,
    options: GetFromPatternOptions = {} as GetFromPatternOptions,
  ): Promise<Record<string, any> | undefined> {
    await this.#verifyEncryptation();
    const { multiple = true, exact = false, doNotDecrypt = false } = options;
    const decryptValues = this.#doNotEncryptValues || doNotDecrypt;
    const keys = Object.keys(this.storage).filter((key) => {
      if (exact) {
        return key === this.#getKey(pattern);
      }

      if (this.#prefix) {
        return key.includes(pattern) && key.includes(this.#prefix);
      }

      return key.includes(pattern);
    });

    if (!keys.length) {
      return undefined;
    }

    if (!multiple) {
      const [key] = keys;

      const formattedKey = this.#prefix
        ? key.replace(`${this.#prefix}:`, '')
        : key;

      if (this.#notifyHandler) {
        this.#notifyHandler({
          type: 'remove',
          key: formattedKey,
        });
      }

      return await this.getItem(formattedKey, decryptValues);
    }

    const parsedKeys = keys.map((key) => {
      const formattedKey = this.#prefix
        ? key.replace(`${this.#prefix}:`, '')
        : key;

      return formattedKey;
    });

    const values = await Promise.all(
      parsedKeys.map((key) => this.getItem(key, decryptValues)),
    );

    const value = parsedKeys.reduce(
      (accumulator: Record<string, any>, key, index) => {
        accumulator[key] = values[index];

        return accumulator;
      },
      {},
    );

    this.#notifier({
      type: 'get',
      key: keys,
      value,
    });

    return value;
  }

  public clear(): void {
    this.storage.clear();

    this.#notifier({
      type: 'clear',
    });
  }

  public key(index: number): string | null {
    const value = this.storage.key(index) || null;

    this.#notifier({
      type: 'key',
      index,
      value,
    });

    return value;
  }

  public async encryptValue(value: any): Promise<string> {
    await this.#verifyEncryptation();
    const parsedValue = this.#doNotParseValues ? value : JSON.stringify(value);
    const encryptedValue = await this.#encryptation.encrypt(parsedValue);

    return encryptedValue;
  }

  public async decryptValue<DataType = any>(
    value: string,
  ): Promise<DataType | null> {
    await this.#verifyEncryptation();
    const decryptedValue = await this.#encryptation.decrypt(value);

    try {
      return (
        this.#doNotParseValues ? decryptedValue : JSON.parse(decryptedValue)
      ) as DataType;
    } catch {
      /* istanbul ignore next */
      return null;
    }
  }

  public async hash(value: string): Promise<string> {
    return hashAsyncSHA256(value);
  }

  /**
   * TTL API
   */

  /**
   * Returns a valid TTL record.
   *
   * If the key does not exist, is invalid or has expired,
   * `Promise<null>` is returned.
   *
   * Expired items are automatically removed from storage.
   *
   * @template T
   * @param {string} key Storage key.
   *
   * @returns {Promise<TTLStorageValue<T> | null>}
   *
   * @private
   */
  async #getTTLRecord<T = unknown>(
    key: string,
    doNotDecrypt = false,
  ): Promise<TTLStorageValue<T> | null> {
    const item = await this.getItem<TTLStorageValue<T>>(key, doNotDecrypt);

    if (!item) {
      return null;
    }

    if (
      item == null ||
      typeof item !== 'object' ||
      typeof item.expiresAt !== 'number'
    ) {
      return null;
    }

    if (Date.now() >= item.expiresAt) {
      this.removeItem(key);

      return null;
    }

    return item;
  }

  public async setTTL<T>({
    key,
    value,
    ttl,
    doNotEncrypt = false,
  }: SetTTLItemParams<T>): Promise<void> {
    const expiresAt =
      ttl instanceof Date ? ttl.getTime() : Date.now() + ttl * 1000;

    const item: TTLStorageValue<T> = {
      value,
      expiresAt,
    };

    await this.setItem(key, item, doNotEncrypt);
  }

  public async getTTL<T = unknown>(
    key: string,
    doNotDecrypt = false,
  ): Promise<T | null> {
    const item = await this.#getTTLRecord<T>(key, doNotDecrypt);
    return item?.value ?? null;
  }

  public async hasTTL(key: string): Promise<boolean> {
    const item = await this.#getTTLRecord(key);
    return item !== null;
  }

  public async getTTLMetadata(key: string): Promise<TTLMetadata | null> {
    const item = await this.#getTTLRecord(key);

    if (!item) {
      return null;
    }

    return {
      expiresAt: new Date(item.expiresAt),
      remaining: item.expiresAt - Date.now(),
      expired: Date.now() >= item.expiresAt,
    };
  }

  public async getRemainingTTL(key: string): Promise<number | null> {
    const item = await this.#getTTLRecord(key);

    if (!item) {
      return null;
    }

    const remaining = (item.expiresAt - Date.now()) / 1000;

    return remaining > 0 ? remaining : 0;
  }

  public async refreshTTL({ key, ttl }: RefreshTTLParams): Promise<boolean> {
    const item = await this.#getTTLRecord(key);

    if (!item) {
      return false;
    }

    const expiresAt = ttl instanceof Date ? ttl.getTime() : Date.now() + ttl;

    item.expiresAt = expiresAt;

    await this.setItem(key, item);

    return true;
  }

  public async removeTTL(key: string): Promise<boolean> {
    const item = await this.#getTTLRecord(key);

    if (!item) {
      return false;
    }

    this.removeItem(key);
    await this.setItem(key, item.value);

    return true;
  }

  public async hasExpired(key: string): Promise<boolean> {
    const item = await this.#getTTLRecord(key);

    return item === null;
  }
}

/* v8 ignore start -- @preserve */
if (typeof window !== 'undefined') {
  (window as any).EncryptStorageWebApi = EncryptStorageWebApi;
}

if (typeof window !== 'undefined' && window?.globalThis) {
  // oxlint-disable-next-line no-unsafe-optional-chaining
  (window?.globalThis as any).EncryptStorageWebApi = EncryptStorageWebApi;
}
/* v8 ignore end -- @preserve */
