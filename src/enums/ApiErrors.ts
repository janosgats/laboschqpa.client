import {ApiErrorDescriptor} from "~/utils/api/ApiErrorDescriptorUtils";

export default class ApiError {
    private errorCategory: string;
    private errorCode: number;

    getErrorCategory = () => this.errorCategory;
    getErrorCode = () => this.errorCode;

    constructor(errorCategory: string, errorCode: number | string) {
        this.errorCategory = errorCategory;
        this.errorCode = Number.parseInt(errorCode as string);
    }

    public is(apiErrorDescriptor: ApiErrorDescriptor): boolean {
        if (!(apiErrorDescriptor instanceof ApiErrorDescriptor)) {
            return false;
        }
        return apiErrorDescriptor
            && apiErrorDescriptor.apiErrorCategory === this.errorCategory
            && Number.parseInt(apiErrorDescriptor.apiErrorCode as unknown as string) === this.errorCode;
    }
}

export const fieldValidationFailed_FIELD_VALIDATION_FAILED = new ApiError("fieldValidationFailed", 1);
