/**
 * This might be a downscaled or other optimized variant of the original file.
 */
export function getUrlOfFile(fileId: number): string {
    return `/filehost/file/get/?id=${fileId}`;
}

/**
 * This is always the original file. You can use it to download, etc...
 */
export function getUrlOfOriginalFile(fileId: number): string {
    return `/filehost/file/get/?id=${fileId}&forceOriginal=true`;
}

/**
 * This might be a downscaled or other optimized variant of the original file.
 */
export function getUrlOfImage(fileId: number, size: number): string {
    return `/filehost/file/get/?id=${fileId}&wantedImageSize=${size}`;
}