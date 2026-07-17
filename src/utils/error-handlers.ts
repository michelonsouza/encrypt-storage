import { NullValueError, UndefinedValueError } from '@/errors';

export function nullValueErrorHandler<T = unknown>(value: T): T {
  if (value === null) {
    throw new NullValueError();
  }

  return value;
}

export function undefinedValueErrorHandler<T = unknown>(value: T): T {
  if (value === undefined) {
    throw new UndefinedValueError();
  }

  return value;
}
