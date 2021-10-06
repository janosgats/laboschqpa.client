import Exception from "~/exception/Exception";

export default class TooManyRequestsRateLimitException extends Exception {
  constructor(message: string, payload: any = {}) {
    super(message, payload);
  }
}
