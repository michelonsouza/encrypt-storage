export class UndefinedValueError extends Error {
  constructor() {
    super(
      'The value parameter cannot be undefined. Please provide a valid value.',
    );
    this.name = 'UndefinedValueError';
  }
}
