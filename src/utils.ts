import { AES, Rabbit, RC4, RC4Drop, enc } from 'crypto-js';

export type EncAlgorithm = 'AES' | 'Rabbit' | 'RC4' | 'RC4Drop';
export type Encryptation = {
  encrypt(value: string): string;
  decrypt(value: string): string;
};

export function getEncriptation(
  encAlgorithm: EncAlgorithm,
  secretKey: string,
): Encryptation {
  const algorithms = {
    AES,
    Rabbit,
    RC4,
    RC4Drop,
  };

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
