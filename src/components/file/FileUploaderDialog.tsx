import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography} from '@material-ui/core';
import {Publish} from '@material-ui/icons';
import React, {FC, useState} from 'react';
import FileToUpload, {UploadedFileType} from '~/model/usergeneratedcontent/FileToUpload';
import {isValidNonEmptyString} from "~/utils/CommonValidators";
import {Alert} from "@material-ui/lab";
import InsertPhotoIcon from '@material-ui/icons/InsertPhoto';

interface Props {
    uploadedFileType: UploadedFileType;
    onUploadInitiation: (fileToUpload: FileToUpload) => void;
    isOpen: boolean;
    onClose: () => void;
    displayConsiderEmbeddingFileAsImageAlert?: boolean;
    overrideUploadButtonText?: string;
}

const imageFileExtensions = ['jpg', 'jpeg', 'png', 'svg', 'gif', 'bmp', 'ico', 'tiff', 'eps', 'raw',];

function doesFileNameLookLikeAnImage(fileName: string): boolean {
    if (!isValidNonEmptyString(fileName)) {
        return false;
    }
    const lowercaseFileName = fileName.toLowerCase();
    return imageFileExtensions.some(item => lowercaseFileName.endsWith(item));
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
            <DialogTitle>{props.uploadedFileType === UploadedFileType.IMAGE ? 'Kép ' : 'Fájl '} feltöltés</DialogTitle>
            <DialogContent>
                <Typography variant="caption">Max 30MB</Typography>
                <Box mx="auto" width="fit-content">
                    <Button variant="outlined" component="label" startIcon={<Publish/>} fullWidth>
                        <Typography>{file?.name || 'SEARCH FILE'}</Typography>
                        <input
                            type="file"
                            hidden
                            onChange={onFileChange}
                            {...(props.uploadedFileType === UploadedFileType.IMAGE ? {accept: 'image/*'} : {})}
                        />
                    </Button>
                    {props.displayConsiderEmbeddingFileAsImageAlert && doesFileNameLookLikeAnImage(file?.name) && (
                        <>
                            <br/>
                            <br/>
                            <Alert variant="outlined" style={{borderRadius: '1rem'}} severity="info">
                                <p>Ez egy képfájlnak tűnik. Fontold meg, hogy a helyett, hogy feltöltöd csatolmányként,
                                    inkább beágyazod a beadásba!</p>
                                <p>Ezt a <b>szerkesztőben található <InsertPhotoIcon/> alakú gombbal tudod megtenni.</b></p>
                            </Alert>
                        </>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose} color="secondary" variant="outlined">
                    Mégsem
                </Button>
                <Button onClick={onUploadButtonClicked} color="primary" variant="contained" disabled={!file}>
                    {isValidNonEmptyString(props.overrideUploadButtonText)? props.overrideUploadButtonText : 'Feltöltés'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FileUploaderDialog;
