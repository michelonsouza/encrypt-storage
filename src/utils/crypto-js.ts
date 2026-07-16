import { AES, SHA256, mode, enc } from 'crypto-js';

import type { CryptoJSEncryptAlgorithms, SyncEncryptation } from '@/@types';

export function getSyncEncryptation(
  encryptationAlgorithm: CryptoJSEncryptAlgorithms,
  secretKey: string,
): SyncEncryptation {
  let encryptMode = mode.CBC;
  const [_, algorithm] = encryptationAlgorithm.split('-');
  encryptMode = algorithm ? mode[algorithm as keyof typeof mode] : encryptMode;

  return {
    encrypt(value: string): string {
      return AES.encrypt(value, secretKey, {
        mode: encryptMode,
      }).toString();
    },
    decrypt(value: string): string {
      return AES.decrypt(value, secretKey, {
        mode: encryptMode,
      }).toString(enc.Utf8);
    },
  };
}

export function hashSyncSHA256(value: string, secret: string): string {
  const hashedValue = SHA256(value, {
    secret,
  });

  return hashedValue.toString();
}
