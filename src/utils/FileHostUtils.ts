function getUrlOfFile(fileId: number): string {
    return `/filehost/file/?id=${fileId}`;
}

const FileHostUtils = {
    getUrlOfFile
};

export default FileHostUtils;