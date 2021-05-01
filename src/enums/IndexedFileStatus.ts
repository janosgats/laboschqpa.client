export enum IndexedFileStatus {
    ADDED_TO_DATABASE_INDEX = 0,
    PRE_UPLOAD_PROCESSING = 1,
    UPLOADING = 2,
    UPLOAD_STREAM_SAVED = 3,
    AVAILABLE = 4,
    DELETED = 5,
    FAILED = 6,
    ABORTED_BY_FILE_HOST = 7,
    CLEANED_UP_AFTER_FAILED = 8,
    CLEANED_UP_AFTER_ABORTED = 9,
    FAILED_DURING_DELETION = 10,
}

export interface IndexedFileStatusDataEntry {
    status: IndexedFileStatus;
    displayName: string;
}

export const indexedFileStatusData: Record<IndexedFileStatus, IndexedFileStatusDataEntry> = {
    [IndexedFileStatus.ADDED_TO_DATABASE_INDEX]: {
        status: IndexedFileStatus.ADDED_TO_DATABASE_INDEX,
        displayName: "Added to database index"
    },
    [IndexedFileStatus.PRE_UPLOAD_PROCESSING]: {
        status: IndexedFileStatus.PRE_UPLOAD_PROCESSING,
        displayName: "Pre-upload processing"
    },
    [IndexedFileStatus.UPLOADING]: {
        status: IndexedFileStatus.UPLOADING,
        displayName: "Uploading"
    },
    [IndexedFileStatus.UPLOAD_STREAM_SAVED]: {
        status: IndexedFileStatus.UPLOAD_STREAM_SAVED,
        displayName: "Upload stream saved"
    },
    [IndexedFileStatus.AVAILABLE]: {
        status: IndexedFileStatus.AVAILABLE,
        displayName: "Available"
    },
    [IndexedFileStatus.DELETED]: {
        status: IndexedFileStatus.DELETED,
        displayName: "Deleted"
    },
    [IndexedFileStatus.FAILED]: {
        status: IndexedFileStatus.FAILED,
        displayName: "Failed"
    },
    [IndexedFileStatus.ABORTED_BY_FILE_HOST]: {
        status: IndexedFileStatus.ABORTED_BY_FILE_HOST,
        displayName: "Aborted by FileHost"
    },
    [IndexedFileStatus.CLEANED_UP_AFTER_FAILED]: {
        status: IndexedFileStatus.CLEANED_UP_AFTER_FAILED,
        displayName: "Cleaned up after failed"
    },
    [IndexedFileStatus.CLEANED_UP_AFTER_ABORTED]: {
        status: IndexedFileStatus.CLEANED_UP_AFTER_ABORTED,
        displayName: "Cleaned up after aborted"
    },
    [IndexedFileStatus.FAILED_DURING_DELETION]: {
        status: IndexedFileStatus.FAILED_DURING_DELETION,
        displayName: "Failed during deletion"
    },
};
