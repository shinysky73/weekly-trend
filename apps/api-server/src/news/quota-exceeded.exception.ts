export class QuotaExceededException extends Error {
  constructor(message = 'Google CSE API quota exceeded') {
    super(message);
    this.name = 'QuotaExceededException';
  }
}
