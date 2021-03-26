import Exception from "~/exception/Exception";

export default class EndpointNotFoundException extends Exception {
  public httpStatusCode;
  constructor(message = "Not found", httpStatusCode = 404, payload: any = {}) {
    super(message, payload);
    this.httpStatusCode = httpStatusCode;
  }
}
