import { pbkdf2 } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';

import type { EncryptAlgorithms } from '@/@types';

export const encoder = new TextEncoder();
export const decoder = new TextDecoder();

export const PBKDF2_SALT = 'encrypt-storage';
const SALT = encoder.encode(PBKDF2_SALT);
const PBKDF2_SYNC_ITERATIONS = 25_000;
const PBKDF2_ASYNC_ITERATIONS = 100_000;
const PBKDF2_KEY_LENGTH = 32;

const syncKeys = new Map<string, Uint8Array>();
const asyncKeys = new Map<string, CryptoKey>();

/**
 * @description Derive key syncronously
 * @param {string} secret secret key to encrypt
 * @returns Uint8Array
 */
export function deriveSyncKey(secret: string): Uint8Array {
  const cached = syncKeys.get(secret);

  /* v8 ignore start -- @preserve */
  if (cached) {
    return cached;
  }
  /* v8 ignore stop -- @preserve */

  const key = pbkdf2(sha256, encoder.encode(secret), SALT, {
    c: PBKDF2_SYNC_ITERATIONS,
    dkLen: PBKDF2_KEY_LENGTH,
  });

  syncKeys.set(secret, key);

  return key;
}

/**
 * @description Derive key asyncronously
 * @param {string} secret secret key to encrypt
 * @param {EncryptAlgorithms} algorithm encryption algorithm
 * @returns {Promise<CryptoKey>} `Promise<CryptoKey>`
 */
export async function deriveAsyncKey(
  secret: string,
  algorithm: EncryptAlgorithms,
): Promise<CryptoKey> {
  const cacheKey = `${algorithm}:${secret}`;

  const cached = asyncKeys.get(cacheKey);

  /* v8 ignore start -- @preserve */
  if (cached) {
    return cached;
  }
  /* v8 ignore stop -- @preserve */

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  const cryptoKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: SALT,
      iterations: PBKDF2_ASYNC_ITERATIONS,
    },
    keyMaterial,
    {
      name: algorithm,
      length: 256,
    },
    false,
    ['encrypt', 'decrypt'],
  );

  asyncKeys.set(cacheKey, cryptoKey);

  return cryptoKey;
}
