import React, {FC, useState} from "react";
import FileToUpload, {UploadedFileType} from "~/model/usergeneratedcontent/FileToUpload";
import {Button, Dialog, DialogActions, DialogContent} from "@material-ui/core";

interface Props {
    uploadedFileType: UploadedFileType;
    onUploadInitiation: (fileToUpload: FileToUpload) => void;
    isOpen: boolean;
    onClose: () => void;
}

const FileUploaderDialog: FC<Props> = (props) => {
    const [file, setFile] = useState<File>();

    const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        if (e.target?.files?.length) {
            setFile(e.target.files[0]);
        }
    }

    const onUploadButtonClicked: React.MouseEventHandler<HTMLInputElement> = async (e) => {
        props.onUploadInitiation(new FileToUpload(file, props.uploadedFileType));
    }

    return (
        <Dialog open={props.isOpen} onClose={props.onClose}>
            <DialogContent>
                <input type="file"
                       onChange={onFileChange}
                       {
                           ...(props.uploadedFileType === UploadedFileType.IMAGE
                               ? {accept: "image/*"}
                               : {})
                       }
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose} color="secondary">
                    Cancel
                </Button>
                <Button onClick={onUploadButtonClicked} color="primary" disabled={!file}>
                    Upload
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FileUploaderDialog;
