import React, {FC, useState} from "react";
import FileToUpload, {UploadedFileType} from "~/model/usergeneratedcontent/FileToUpload";

interface Props {
    uploadedFileType: UploadedFileType;
    onUploadInitiation: (fileToUpload: FileToUpload) => void;
}

const FileUploader: FC<Props> = (props) => {
    const [file, setFile] = useState<File>();

    const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        setFile(e.target.files[0]);
    }

    const onUploadButtonClicked: React.MouseEventHandler<HTMLInputElement> = async (e) => {
        props.onUploadInitiation(new FileToUpload(file, props.uploadedFileType));
    }

    return (
        <>
            <div style={{borderStyle: "solid", borderColor: "red"}}>
                <p>TODO: This should be a modal</p>

                <input
                    type="file"
                    onChange={onFileChange}
                    {
                        ...(props.uploadedFileType === UploadedFileType.IMAGE
                            ? {accept: "image/*"}
                            : {})
                    }
                />
                <button onClick={onUploadButtonClicked}>Upload</button>
            </div>
        </>
    );
};

export default FileUploader;
