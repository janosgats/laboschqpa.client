/**
 * This might be a downscaled or other optimized variant of the original file.
 */
function getUrlOfFile(fileId: number): string {
    return `/filehost/file/?id=${fileId}`;
}

/**
 * This is always the original file. You can use it to download, etc...
 */
function getUrlOfOriginalFile(fileId: number): string {
    return getUrlOfFile(fileId);//TODO: This should return the original-file downloader URL, once it's implemented in FileHost
}

const FileHostUtils = {
    getUrlOfFile,
    getUrlOfOriginalFile,
};

export default FileHostUtils;