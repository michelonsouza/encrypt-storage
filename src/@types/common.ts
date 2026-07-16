export type WebApiEncryptAlgorithms = 'AES-GCM' | 'AES-CBC' | 'AES-CTR';

export type CryptoJSEncryptAlgorithms =
  | 'AES'
  | 'AES-CBC'
  | 'AES-CFB'
  | 'AES-CTR'
  | 'AES-OFB'
  | 'AES-ECB';

export type StorageType = 'localStorage' | 'sessionStorage';

export type ChangeNotifyType =
  | 'set'
  | 'set:cookie'
  | 'get'
  | 'get:cookie'
  | 'getMultiple'
  | 'setMultiple'
  | 'remove'
  | 'remove:cookie'
  | 'removeMultiple'
  | 'clear'
  | 'length'
  | 'key';

export interface NotifyHandlerParams<ValueType = any> {
  type: ChangeNotifyType;
  key?: string | string[];
  value?: ValueType;
  index?: number;
}

export type NotifyHandler = (params: NotifyHandlerParams) => void;

export interface RemoveFromPatternOptions {
  exact?: boolean;
}

export interface GetFromPatternOptions extends RemoveFromPatternOptions {
  multiple?: boolean;
  doNotDecrypt?: boolean;
}

export interface SetItemWithTTLParams {
  /**
   * @description Key name
   */
  key: string;
  /**
   * @description Value
   */
  value: any;
  /**
   * @description Do not encrypt
   */
  doNotEncrypt?: boolean;
  /**
   * @description Time to live
   */
  ttl: number | Date;
}

export interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export interface SyncCookieInterface {
  /**
   * @description Set cookie
   * @param {string} key
   * @param {any} value
   * @param {CookieOptions} options
   * @returns {void} `void`
   */
  set(key: string, value: any, options?: CookieOptions): void;
  /**
   * @description Get cookie
   * @param {string} key
   * @returns {DataType | null} `DataType | null`
   */
  get<DataType = any>(key: string): DataType | null;
  /**
   * @description Remove cookie
   * @param {string} key
   * @param {RemoveCookieOptions} options
   * @returns {void} `void`
   */
  remove(key: string, options?: RemoveCookieOptions): void;
}

export interface AsyncCookieInterface {
  /**
   * @description Set cookie
   * @param {string} key
   * @param {any} value
   * @param {CookieOptions} options
   * @returns {Promise<void>} `Promise<void>`
   */
  set(key: string, value: any, options?: CookieOptions): Promise<void>;
  /**
   * @description Get cookie
   * @param {string} key
   * @returns {Promise<DataType | null>} `Promise<DataType | null>`
   */
  get<DataType = any>(key: string): Promise<DataType | null>;
  /**
   * @description Remove cookie
   * @param {string} key
   * @param {RemoveCookieOptions} options
   * @returns {void} `void`
   */
  remove(key: string, options?: RemoveCookieOptions): void;
}

export interface RemoveCookieOptions {
  path?: string;
  domain?: string;
}

export interface SyncEncryptation {
  encrypt(value: string): string;
  decrypt(value: string): string;
}

export interface AsyncEncryptation {
  encrypt(value: string): Promise<string>;
  decrypt(value: string): Promise<string>;
}

export interface BaseEcnryptStorageOptions {
  /**
   * @description Prefix to be added to all keys
   * @default ''
   */
  prefix?: string;
  /**
   * @description Enable state management
   * @default false
   */
  stateManagementUse?: boolean;
  /**
   * @description Storage you want to use
   * @default localStorage
   */
  storageType?: StorageType;
  /**
   * @description Not encrypt values
   * @default false
   */
  doNotEncryptValues?: boolean;
  /**
   * @description Not parse values
   * @default false
   */
  doNotParseValues?: boolean;
  /**
   * @description Notify handler
   * @default undefined
   */
  notifyHandler?: NotifyHandler;
}

export interface SyncEncryptStorageOptions extends BaseEcnryptStorageOptions {
  /**
   * @description Encrypt engine
   * @default 'crypto-js'
   */
  engine: 'crypto-js';
  /**
   * @description CryptoJS encrypt algorithm
   * @default 'AES'
   */
  encAlgorithm?: CryptoJSEncryptAlgorithms;
}

export interface AsyncEncryptStorageOptions extends BaseEcnryptStorageOptions {
  /**
   * @description Encrypt engine
   * @default 'web-api'
   */
  engine: 'web-crypto';
  /**
   * @description WebApi encrypt algorithm
   * @default 'AES-GCM'
   */
  encAlgorithm?: WebApiEncryptAlgorithms;
}

export type EncryptStorageOptions =
  | SyncEncryptStorageOptions
  | AsyncEncryptStorageOptions;
