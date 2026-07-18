import {
  split,
  concat,
  bufferToHex,
  arrayBufferToBase64,
  base64ToArrayBuffer,
} from './base64-buffer';
import { deriveAsyncKey, encoder, decoder } from './pbkdf2';

import type { AsyncEncryptation, EncryptAlgorithms } from '@/@types';

const algorithms = {
  'AES-GCM': {
    ivLength: 12,

    create(iv: Uint8Array): AesGcmParams {
      return {
        name: 'AES-GCM',
        // @ts-expect-error
        iv,
      };
    },
  },

  'AES-CBC': {
    ivLength: 16,

    create(iv: Uint8Array): AesCbcParams {
      return {
        name: 'AES-CBC',
        // @ts-expect-error
        iv,
      };
    },
  },

  'AES-CTR': {
    ivLength: 16,

    create(counter: Uint8Array): AesCtrParams {
      return {
        name: 'AES-CTR',
        // @ts-expect-error
        counter,
        length: 64,
      };
    },
  },
} satisfies Record<
  EncryptAlgorithms,
  {
    ivLength: number;
    create(iv: Uint8Array): AesGcmParams | AesCbcParams | AesCtrParams;
  }
>;

export async function getAsyncEncryptation(
  encryptationAlgorithm: EncryptAlgorithms,
  secretKey: string,
): Promise<AsyncEncryptation> {
  const key = await deriveAsyncKey(secretKey, encryptationAlgorithm);

  const algorithm = algorithms[encryptationAlgorithm];

  return {
    async encrypt(value: string): Promise<string> {
      const iv = crypto.getRandomValues(new Uint8Array(algorithm.ivLength));

      const encrypted = await crypto.subtle.encrypt(
        algorithm.create(iv),
        key,
        encoder.encode(value),
      );

      return arrayBufferToBase64(concat(iv, encrypted));
    },

    async decrypt(value: string): Promise<string> {
      const payload = base64ToArrayBuffer(value);

      const { iv, cipher } = split(payload, algorithm.ivLength);

      const decrypted = await crypto.subtle.decrypt(
        algorithm.create(iv),
        key,
        cipher,
      );

      return decoder.decode(decrypted);
    },
  };
}

export async function hashAsyncSHA256(value: string): Promise<string> {
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(value));

  return bufferToHex(buffer);
}
