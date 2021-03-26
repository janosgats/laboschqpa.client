export const API_ERROR_DESCRIPTOR_HTTP_STATUS_CODE = 409;

export class ApiErrorDescriptor {
  public apiErrorCategory: string;
  public apiErrorCode: number;
  public apiErrorName: string | null;
  public message: string | null;
  public payload: Record<string, any> | null;
  public payloadSerializationError: boolean | null;
  public timestamp: Date | null;
}

export const formatApiErrorDescriptorForBasicDisplay = (
  errorDescriptor: ApiErrorDescriptor
): string => {
  return `${errorDescriptor.apiErrorCategory} > ${
    errorDescriptor.apiErrorName
  }: ${errorDescriptor.message}<br>
    payload: ${JSON.stringify(errorDescriptor.payload)}
    <br>
    payloadSerializationError: ${
      errorDescriptor.payloadSerializationError
    }<br>timestamp: ${errorDescriptor.timestamp}`;
};

export default class ApiErrorDescriptorUtils {
  public static getApiErrorDescriptorIfPossible(
    statusCode: number | null,
    responseBody: Record<string, any>
  ): ApiErrorDescriptor | null {
    if (!this.isApiErrorDescriptor(statusCode, responseBody)) {
      return null;
    }

    const apiErrorDescriptor: ApiErrorDescriptor = new ApiErrorDescriptor();

    apiErrorDescriptor.apiErrorCategory = responseBody.apiErrorCategory;
    apiErrorDescriptor.apiErrorCode = responseBody.apiErrorCode;
    apiErrorDescriptor.apiErrorName = responseBody.apiErrorName;
    apiErrorDescriptor.message = responseBody.message;
    apiErrorDescriptor.payload = responseBody.payload;

    apiErrorDescriptor.payloadSerializationError = this.normalizeBooleanValue(
      responseBody.payloadSerializationError
    );

    try {
      apiErrorDescriptor.timestamp = new Date(responseBody.timestamp);
    } catch (e) {
      apiErrorDescriptor.timestamp = null;
    }

    return apiErrorDescriptor;
  }

  private static normalizeBooleanValue(originalValue: any): boolean {
    if (originalValue === true || originalValue === "true") {
      return true;
    } else if (originalValue === false || originalValue === "false") {
      return false;
    } else {
      return null;
    }
  }

  public static isApiErrorDescriptor(
    statusCode: number | null,
    responseBody: Record<string, any>
  ): boolean {
    if (isNaN(statusCode)) {
      return false;
    }
    if (statusCode !== API_ERROR_DESCRIPTOR_HTTP_STATUS_CODE) {
      return false;
    }

    if (!responseBody) {
      return false;
    }

    return (
      responseBody.apiErrorCategory &&
      responseBody.apiErrorCode &&
      typeof responseBody.apiErrorCategory === "string" &&
      Number.isInteger(responseBody.apiErrorCode)
    );
  }
}
