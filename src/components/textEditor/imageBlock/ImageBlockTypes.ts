export interface ImageBlockSpec {
    isExternalImage: boolean;
    indexedFileId?: number;
    externalUrl?: string;
    size: number;
    alignment: ImageAlignment;
}

export interface EditImageCommand {
    size: number;
    alignment: ImageAlignment;
}

export enum ImageAlignment {
    center = 'center',
    left = 'left',
    right = 'right',
}