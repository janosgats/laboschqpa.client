import Exception from "~/exception/Exception";

export default class FrontendApiCallException extends Exception {
  constructor(message: string, payload: any = {}) {
    super(message, payload);
  }
}
