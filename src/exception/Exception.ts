export default class Exception extends Error {
  public payload: any;
  constructor(message: string, payload: any = {}) {
    super(message);
    this.payload = payload;
  }
}
