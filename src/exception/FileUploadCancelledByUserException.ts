import Exception from "~/exception/Exception";

export default class FileUploadCancelledByUserException extends Exception {
    constructor(message: string = '', payload: any = {}) {
        super(message, payload);
    }
}
