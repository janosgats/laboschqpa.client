import Exception from "~/exception/Exception";

export default class UnauthorizedApiCallException extends Exception {
  constructor(message: string, payload: any = {}) {
    super(message, payload);
  }
}
