import { gcm, cbc, ctr } from '@noble/ciphers/aes.js';
import { sha256 } from '@noble/hashes/sha2.js';

import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  concat,
  split,
} from './base64-buffer';
import { deriveSyncKey, encoder, decoder } from './pbkdf2';

import type { EncryptAlgorithms, SyncEncryptation } from '@/@types';
import type { Cipher, CipherWithOutput } from '@noble/ciphers/utils.js';

interface AlgorithmType {
  ivLength: number;
  create: (key: Uint8Array, iv: Uint8Array) => Cipher | CipherWithOutput;
}

type AlgorithmInterface = Record<EncryptAlgorithms, AlgorithmType>;

const algorithms: AlgorithmInterface = {
  'AES-GCM': {
    ivLength: 12,
    create: (key: Uint8Array, iv: Uint8Array) => gcm(key, iv),
  },

  'AES-CBC': {
    ivLength: 16,
    create: (key: Uint8Array, iv: Uint8Array) => cbc(key, iv),
  },

  'AES-CTR': {
    ivLength: 16,
    create: (key: Uint8Array, iv: Uint8Array) => ctr(key, iv),
  },
};

export function getSyncEncryptation(
  encryptationAlgorithm: EncryptAlgorithms,
  secretKey: string,
): SyncEncryptation {
  const key = deriveSyncKey(secretKey);
  const config = algorithms[encryptationAlgorithm];

  return {
    encrypt(value: string): string {
      const iv = globalThis.crypto.getRandomValues(
        new Uint8Array(config.ivLength),
      );

      const cipher = config.create(key, iv).encrypt(encoder.encode(value));

      return arrayBufferToBase64(concat(iv, cipher));
    },
    decrypt(value: string): string {
      const payload = base64ToArrayBuffer(value);

      const { iv, cipher } = split(payload, config.ivLength);

      const decrypted = config.create(key, iv).decrypt(cipher);

      return decoder.decode(decrypted);
    },
  };
}

export function hashSyncNobleSHA256(value: string, secret: string): string {
  const key = deriveSyncKey(secret);
  const hashedValue = sha256(Uint8Array.from([key, encoder.encode(value)]));

  return hashedValue.toString();
}
