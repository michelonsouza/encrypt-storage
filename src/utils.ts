import { AES, Rabbit, RC4, RC4Drop, enc } from 'crypto-js';

export type EncAlgorithm = 'AES' | 'Rabbit' | 'RC4' | 'RC4Drop';
export type Encryptation = {
  encrypt(value: string): string;
  decrypt(value: string): string;
};

const algorithms = {
  AES,
  Rabbit,
  RC4,
  RC4Drop,
};

export function getEncriptation(
  encAlgorithm: EncAlgorithm,
  secretKey: string,
): Encryptation {
  return {
    encrypt: (value: string): string => {
      return algorithms[encAlgorithm].encrypt(value, secretKey).toString();
    },
    decrypt: (value: string): string => {
      return algorithms[encAlgorithm]
        .decrypt(value, secretKey)
        .toString(enc.Utf8);
    },
  };
}
