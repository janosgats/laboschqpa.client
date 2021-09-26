import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography} from '@material-ui/core';
import {Publish} from '@material-ui/icons';
import React, {FC, useState} from 'react';
import FileToUpload, {UploadedFileType} from '~/model/usergeneratedcontent/FileToUpload';

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
    };

    const onUploadButtonClicked: React.MouseEventHandler<HTMLInputElement> = async (e) => {
        props.onUploadInitiation(new FileToUpload(file, props.uploadedFileType));
    };

    return (
        <Dialog open={props.isOpen} onClose={props.onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{props.uploadedFileType === UploadedFileType.IMAGE ? 'Kép ':'Fájl '} feltöltés</DialogTitle>
            <DialogContent>
                <Box mx="auto" width="fit-content">
                    <Button variant="outlined" component="label" startIcon={<Publish />} fullWidth>
                        <Typography>{file?.name || 'SEARCH FILE'}</Typography>
                        <input
                            type="file"
                            hidden
                            onChange={onFileChange}
                            {...(props.uploadedFileType === UploadedFileType.IMAGE ? {accept: 'image/*'} : {})}
                        />
                    </Button>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose} color="secondary" variant="outlined">
                    Mégsem
                </Button>
                <Button onClick={onUploadButtonClicked} color="primary" variant="contained" disabled={!file}>
                    Feltöltés
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FileUploaderDialog;
