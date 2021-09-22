import {ApiErrorDescriptor} from "~/utils/api/ApiErrorDescriptorUtils";

export enum ApiErrorCategory {
    fieldValidationFailed = "fieldValidationFailed",
    auth = "auth",
    submission = "submission",
    upload = "upload",
    content = "content",
    emailAddress = "emailAddress",
    teamLifecycle = "teamLifecycle",
    riddle = "riddle",
    teamMembership = "teamMembership",
    qrFight = "qrFight",
}

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

export const fieldValidationFailed_FIELD_VALIDATION_FAILED = new ApiError(ApiErrorCategory.fieldValidationFailed, 1);

export const auth_OAUTH2_AUTHORIZATION_REQUEST_FROM_ALREADY_LOGGED_IN_USER = new ApiError(ApiErrorCategory.auth, 1);
export const auth_AUTH_EMAIL_GOT_FROM_OAUTH2_RESPONSE_BELONGS_TO_ANOTHER_ACCOUNT = new ApiError(ApiErrorCategory.auth, 5);
export const auth_CANNOT_FIND_EXISTING_ACCOUNT_TO_LOG_IN = new ApiError(ApiErrorCategory.auth, 7);
export const auth_AUTH_EXTERNAL_ACCOUNT_GOT_FROM_OAUTH2_RESPONSE_BELONGS_TO_ANOTHER_ACCOUNT = new ApiError(ApiErrorCategory.auth, 10);

export const submission_OBJECTIVE_IS_NOT_SUBMITTABLE = new ApiError(ApiErrorCategory.submission, 4);
export const submission_OBJECTIVE_DEADLINE_HAS_PASSED = new ApiError(ApiErrorCategory.submission, 5);

export const upload_STREAM_LENGTH_LIMIT_EXCEEDED = new ApiError(ApiErrorCategory.upload, 2);
export const upload_MIME_TYPE_IS_NOT_IMAGE = new ApiError(ApiErrorCategory.upload, 5);

export const content_CONTENT_IS_NOT_FOUND = new ApiError(ApiErrorCategory.content, 1);

export const emailAddress_EMAIL_ALREADY_BELONGS_TO_A_USER = new ApiError(ApiErrorCategory.emailAddress, 1);
export const emailAddress_VERIFICATION_REQUEST_PHASE_IS_INVALID = new ApiError(ApiErrorCategory.emailAddress, 3);

export const teamLifecycle_THERE_IS_NO_OTHER_LEADER = new ApiError(ApiErrorCategory.teamLifecycle, 5);
export const teamLifecycle_YOU_ARE_ALREADY_MEMBER_OR_APPLICANT_OF_A_TEAM = new ApiError(ApiErrorCategory.teamLifecycle, 7);

export const riddle_A_RIDDLE_HAS_TO_HAVE_EXACTLY_ONE_ATTACHMENT = new ApiError(ApiErrorCategory.riddle, 5);

export const teamMembership_YOU_ARE_NOT_IN_A_TEAM = new ApiError(ApiErrorCategory.teamMembership, 1)

export const qrFight_YOUR_TEAM_ALREADY_SUBMITTED_THIS_TAG = new ApiError(ApiErrorCategory.qrFight, 1);
export const qrFight_TAG_DOES_NOT_EXIST = new ApiError(ApiErrorCategory.qrFight, 2);
export const qrFight_TAG_SECRET_MISMATCH = new ApiError(ApiErrorCategory.qrFight, 3);
export const qrFight_TEAM_RATE_LIMIT_HIT_FOR_QR_FIGHT_SUBMISSIONS = new ApiError(ApiErrorCategory.qrFight, 4);
