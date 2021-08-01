import React, { FC, useState } from "react";
import FileToUpload, { UploadedFileType } from "~/model/usergeneratedcontent/FileToUpload";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@material-ui/core";
import SearchIcon from '@material-ui/icons/Search';

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
        <Dialog 
            open={props.isOpen} 
            onClose={props.onClose}
            maxWidth="sm"
            fullWidth
            >
            <DialogTitle >Upload file</DialogTitle>
            <DialogContent>
                <Button
                    variant="outlined"
                    component="label"
                    startIcon={<SearchIcon />}
                >
                    Search file
                    <input type="file"
                        hidden
                        onChange={onFileChange}
                        {
                        ...(props.uploadedFileType === UploadedFileType.IMAGE
                            ? { accept: "image/*" }
                            : {})
                        }
                    />
                </Button>
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
