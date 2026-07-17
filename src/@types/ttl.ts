export type TTL = number | Date;

/**
 * Parameters used to create or update a TTL item.
 */
export interface SetTTLItemParams<T = unknown> {
  /**
   * Storage key.
   */
  key: string;

  /**
   * Value to be stored.
   */
  value: T;

  /**
   * Expiration time.
   *
   * - number → seconds from now
   * - Date → absolute expiration date
   */
  ttl: TTL;

  /**
   * Store the value without encryption.
   *
   * @default false
   */
  doNotEncrypt?: boolean;
}

/**
 * Parameters used to update an existing TTL.
 */
export interface RefreshTTLParams {
  /**
   * Storage key.
   */
  key: string;

  /**
   * New expiration time.
   *
   * - number → seconds from now
   * - Date → absolute expiration date
   */
  ttl: TTL;
}

/**
 * Metadata about a TTL item.
 */
export interface TTLMetadata {
  /**
   * Expiration timestamp.
   */
  expiresAt: Date;

  /**
   * Remaining time in seconds.
   */
  remaining: number;

  /**
   * Returns true when the item has expired.
   */
  expired: boolean;
}

/**
 * Value stored with TTL.
 */
export interface TTLStorageValue<T = unknown> {
  value: T;
  expiresAt: number;
}

export interface SyncEncryptStorageTTLInterface {
  /**
   * Stores a value with an expiration time.
   *
   * When the TTL expires, the item is automatically removed
   * the next time it is accessed.
   *
   * @template T
   * @param {SetTTLItemParams<T>} params Storage parameters.
   *
   * @example
   * storage.setTTL({
   *   key: 'access_token',
   *   value: token,
   *   ttl: 3600,
   * });
   *
   * @example
   * storage.setTTL({
   *   key: 'access_token',
   *   value: token,
   *   ttl: new Date('2030-01-01'),
   * });
   */
  setTTL<T>(params: SetTTLItemParams<T>): void;

  /**
   * Returns a value previously stored with TTL.
   *
   * If the item has expired, it is automatically removed
   * from storage and `null` is returned.
   *
   * @template T
   * @param {string} key Storage key.
   *
   * @returns {T | null}
   *
   * @example
   * const token = storage.getTTL<string>('access_token');
   */
  getTTL<T = unknown>(key: string, doNotDecrypt?: boolean): T | null;

  /**
   * Returns true if the item exists and has expired.
   *
   * This method does not remove the item.
   *
   * @param {string} key Storage key.
   *
   * @returns {boolean}
   */
  hasExpired(key: string): boolean;

  /**
   * Returns metadata about a TTL item.
   *
   * @param {string} key Storage key.
   *
   * @returns {TTLMetadata | null}
   *
   * @example
   * const info = storage.getTTLMetadata('access_token');
   *
   * console.log(info?.remaining);
   */
  getTTLMetadata(key: string): TTLMetadata | null;

  /**
   * Returns the remaining lifetime in seconds.
   *
   * Returns:
   *
   * - remaining seconds
   * - 0 when expired
   * - null when the key does not exist
   *
   * @param {string} key Storage key.
   */
  getRemainingTTL(key: string): number | null;

  /**
   * Updates the expiration time of an existing TTL item.
   *
   * The stored value remains unchanged.
   *
   * @param {RefreshTTLParams} params Refresh parameters.
   *
   * @returns {boolean}
   *
   * Returns true if the item exists.
   */
  refreshTTL(params: RefreshTTLParams): boolean;

  /**
   * Removes the expiration from a TTL item.
   *
   * The value becomes permanent.
   *
   * @param {string} key Storage key.
   *
   * @returns {boolean}
   */
  removeTTL(key: string): boolean;

  /**
   * Returns true when the key exists.
   *
   * If the key has expired, it is removed and false is returned.
   *
   * @param key Storage key.
   */
  hasTTL(key: string): boolean;
}

export interface AsyncEncryptStorageTTLInterface {
  /**
   * Stores a value with an expiration time.
   *
   * When the TTL expires, the item is automatically removed
   * the next time it is accessed.
   *
   * @template T
   * @param {SetTTLItemParams<T>} params Storage parameters.
   *
   * @returns {Promise<void>}
   *
   * @example
   * await storage.setTTL({
   *   key: 'access_token',
   *   value: token,
   *   ttl: 3600,
   * });
   *
   * @example
   * await storage.setTTL({
   *   key: 'access_token',
   *   value: token,
   *   ttl: new Date('2030-01-01'),
   * });
   */
  setTTL<T>(params: SetTTLItemParams<T>): Promise<void>;

  /**
   * Returns a value previously stored with TTL.
   *
   * If the item has expired, it is automatically removed
   * from storage and `null` is returned.
   *
   * @template T
   * @param {string} key Storage key.
   *
   * @returns {Promise<T | null>}
   *
   * @example
   * const token = await storage.getTTL<string>('access_token');
   */
  getTTL<T = unknown>(key: string, doNotDecrypt?: boolean): Promise<T | null>;

  /**
   * Returns true if the item exists and has expired.
   *
   * This method does not return the stored value.
   *
   * @param {string} key Storage key.
   *
   * @returns {Promise<boolean>}
   */
  hasExpired(key: string): Promise<boolean>;

  /**
   * Returns metadata about a TTL item.
   *
   * @param {string} key Storage key.
   *
   * @returns {Promise<TTLMetadata | null>}
   *
   * @example
   * const info = await storage.getTTLMetadata('access_token');
   *
   * console.log(info?.remaining);
   */
  getTTLMetadata(key: string): Promise<TTLMetadata | null>;

  /**
   * Returns the remaining lifetime in seconds.
   *
   * Returns:
   *
   * - remaining seconds
   * - 0 when expired
   * - null when the key does not exist
   *
   * @param {string} key Storage key.
   *
   * @returns {Promise<number | null>}
   */
  getRemainingTTL(key: string): Promise<number | null>;

  /**
   * Updates the expiration time of an existing TTL item.
   *
   * The stored value remains unchanged.
   *
   * Returns true if the item exists.
   *
   * @param {RefreshTTLParams} params Refresh parameters.
   *
   * @returns {Promise<boolean>}
   */
  refreshTTL(params: RefreshTTLParams): Promise<boolean>;

  /**
   * Removes the expiration from a TTL item.
   *
   * The stored value becomes permanent.
   *
   * @param {string} key Storage key.
   *
   * @returns {Promise<boolean>}
   */
  removeTTL(key: string): Promise<boolean>;

  /**
   * Returns true when the key exists and has not expired.
   *
   * If the key has expired, it is automatically removed
   * and `false` is returned.
   *
   * @param {string} key Storage key.
   *
   * @returns {Promise<boolean>}
   */
  hasTTL(key: string): Promise<boolean>;
}
