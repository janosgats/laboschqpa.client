import Exception from "~/exception/Exception";
import {
  ApiErrorDescriptor,
  formatApiErrorDescriptorForBasicDisplay,
} from "~/utils/api/ApiErrorDescriptorUtils";

export default class ApiErrorDescriptorException extends Exception {
  public apiErrorDescriptor: ApiErrorDescriptor;

  constructor(
    message: string,
    apiErrorDescriptor: ApiErrorDescriptor,
    payload: any = {}
  ) {
    super(
      message + formatApiErrorDescriptorForBasicDisplay(apiErrorDescriptor),
      payload
    );
    this.apiErrorDescriptor = apiErrorDescriptor;
  }
}
