import { CookieOptions } from './cookie';

export type EncAlgorithm = 'AES' | 'Rabbit' | 'RC4' | 'RC4Drop';

export type StorageType = 'localStorage' | 'sessionStorage' | 'cookies';

export interface Encryptation {
  encrypt(value: string): string;
  decrypt(value: string): string;
}

export type ChangeType =
  | 'set'
  | 'set:cookie'
  | 'get'
  | 'get:cookie'
  | 'getMultiple'
  | 'getItemFromPattern'
  | 'getItemFromPattern:cookie'
  | 'getMultiple:cookie'
  | 'setMultiple'
  | 'setMultiple:cookie'
  | 'remove'
  | 'remove:cookie'
  | 'removeMultiple'
  | 'removeMultiple:cookie'
  | 'clear'
  | 'clear:cookie'
  | 'length'
  | 'length:cookie'
  | 'key'
  | 'key:cookie';

export interface NotifyHandlerParams {
  type: ChangeType;
  key?: string | string[];
  value?: any;
  index?: number;
}

export type NotifyHandler = (params: NotifyHandlerParams) => void;

export interface EncryptStorageOptions {
  prefix?: string;
  stateManagementUse?: boolean;
  storageType?: StorageType;
  encAlgorithm?: EncAlgorithm;
  doNotEncryptValues?: boolean;
  doNotParseValues?: boolean;
  notifyHandler?: NotifyHandler;
}

export interface RemoveFromPatternOptions extends CookieOptions {
  exact?: boolean;
}

export interface GetFromPatternOptions extends RemoveFromPatternOptions {
  multiple?: boolean;
  doNotDecrypt?: boolean;
}

export interface SetItemWithTTLParams extends CookieOptions {
  key: string;
  value: any;
  /**
   * `Time to live` in milliseconds or Date
   */
  ttl: number | Date;
}
