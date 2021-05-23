import React, {FC, useContext, useState} from 'react'
import {EditorContext} from "~/context/EditorContextProvider";
import * as FileHostUtils from "~/utils/FileHostUtils";
import {EditImageCommand, ImageBlockSpec} from "~/components/textEditor/imageBlock/ImageBlockTypes";
import {ImageBlockEditor} from "~/components/textEditor/imageBlock/ImageBlockEditor";

interface Props {
    blockProps: ImageBlockSpec;
}

export const ImageBlock: FC<Props> = (props) => {
    const editorContext = useContext(EditorContext);
    const imageBlockSpec: ImageBlockSpec = props.blockProps;

    const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false)

    let imageSrc: string;
    if (imageBlockSpec.isFileHostImage) {
        imageSrc = FileHostUtils.getUrlOfImage(imageBlockSpec.indexedFileId, imageBlockSpec.size);
    } else {
        imageSrc = imageBlockSpec.externalUrl;
    }

    function openEditor(): void {
        setIsEditorOpen(true)
        editorContext.setIsMuiRteReadonly(true);
    }

    function closeEditor(): void {
        setIsEditorOpen(false)
        editorContext.setIsMuiRteReadonly(false);
    }

    function handleEdit(command: EditImageCommand): void {
        closeEditor();
        imageBlockSpec.size = command.size;
        imageBlockSpec.alignment = command.alignment;
    }

    return (
        <div style={{
            borderStyle: editorContext.areSubcomponentsEditable ? 'solid' : 'none',
            borderWidth: 1,
            textAlign: imageBlockSpec.alignment,
        }}>
            <img src={imageSrc}
                 alt="Couldn't load image :/"
                 style={{
                     cursor: 'pointer',
                     maxWidth: imageBlockSpec.size,
                     maxHeight: imageBlockSpec.size,
                 }}
                 onClick={() => {
                     if (editorContext.areSubcomponentsEditable) {
                         openEditor();
                     } else {
                         alert('TODO: Display full image');
                     }
                 }}
            />

            <ImageBlockEditor value={imageBlockSpec}
                              onEdit={handleEdit}
                              onClose={closeEditor}
                              isOpen={isEditorOpen}/>
        </div>
    )
}