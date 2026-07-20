export class NullValueError extends Error {
  constructor() {
    super('The value parameter cannot be null. Please provide a valid value.');
    this.name = 'NullValueError';
  }
}
