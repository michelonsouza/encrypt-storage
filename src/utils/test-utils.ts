import { fakerPT_BR as faker } from '@faker-js/faker';

import { EncryptStorageOptions, NotifyHandlerParams } from '@/@types/types';
import { EncryptStorage } from '@/lib/encrypt-storage';

interface makeSutParams extends EncryptStorageOptions {
  secretKey?: string;
  noOptions?: boolean;
}

export const mockNotify = {
  mockedFn: (params: NotifyHandlerParams) => {
    return params;
  },
};

export function makeSut(
  params: makeSutParams = {} as makeSutParams,
): EncryptStorage {
  const {
    prefix,
    storageType,
    stateManagementUse,
    noOptions,
    encAlgorithm,
    doNotParseValues = false,
    notifyHandler = mockNotify.mockedFn,
    secretKey = faker.string.alphanumeric(10),
  } = params;
  const options = noOptions
    ? undefined
    : {
        prefix,
        storageType,
        stateManagementUse,
        encAlgorithm,
        notifyHandler,
        doNotParseValues,
      };
  return new EncryptStorage(secretKey, options);
}
