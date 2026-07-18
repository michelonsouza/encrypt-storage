export type EncryptAlgorithms = 'AES-GCM' | 'AES-CBC' | 'AES-CTR';

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

/**
 * @description Validation options for encrypt storage setValue validate
 */
export interface ValidationInterface {
  /**
   * @description Whether `null` values are allowed.
   * When disabled, attempting to store `null` throws `NullValueError`.
   * Null don't cause invalid JSON serialization, but can cause unexpected behavior.
   * @default true
   */
  allowNull?: boolean;
  /**
   * @description Whether `undefined` values are allowed.
   * When disabled, attempting to store `undefined` throws `UndefinedValueError`.
   * This prevents invalid JSON serialization.
   * @default false
   */
  allowUndefined?: boolean;
  /**
   * @description Whether strict mode is enabled.
   * When enabled, the `allowNull` and `allowUndefined` options are ignored and `null` and `undefined` values are not allowed.
   * @default false
   */
  strict?: boolean;
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
  /**
   * @description Validation options
   * @default undefined
   */
  validation?: ValidationInterface;
}

export interface SyncEncryptStorageOptions extends BaseEcnryptStorageOptions {
  /**
   * @description Encrypt engine
   * @default 'noble'
   */
  engine: 'noble';
  /**
   * @description CryptoJS encrypt algorithm
   * @default 'AES'
   */
  encAlgorithm?: EncryptAlgorithms;
}

export interface NobleEncryptStorageOptions extends BaseEcnryptStorageOptions {
  /**
   * @description Encrypt engine
   * @default 'noble'
   */
  engine: 'noble';
  /**
   * @description Noble encrypt algorithm
   * @default 'AES-GCM'
   */
  encAlgorithm?: EncryptAlgorithms;
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
  encAlgorithm?: EncryptAlgorithms;
}

export type EncryptStorageOptions =
  | SyncEncryptStorageOptions
  | AsyncEncryptStorageOptions;
