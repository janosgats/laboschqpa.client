import React, {FC, useContext, useState} from 'react'
import {EditorContext} from "~/context/EditorContextProvider";
import {EditImageCommand, ImageBlockSpec} from "~/components/textEditor/imageBlock/ImageBlockTypes";
import {ImageBlockEditor} from "~/components/textEditor/imageBlock/ImageBlockEditor";
import Image from "~/components/image/Image";

interface Props {
    blockProps: ImageBlockSpec;
}

export const ImageBlock: FC<Props> = (props) => {
    const editorContext = useContext(EditorContext);
    const imageBlockSpec: ImageBlockSpec = props.blockProps;

    const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false)

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
        <div style={{textAlign: imageBlockSpec.alignment}}>
            <Image fileId={imageBlockSpec.indexedFileId}
                   maxSize={imageBlockSpec.size}
                   forcedSrc={imageBlockSpec.isExternalImage ? imageBlockSpec.externalUrl : null}
                   overriddenOnClick={editorContext.areSubcomponentsEditable && openEditor}
                   imgStyles={{
                       borderStyle: editorContext.areSubcomponentsEditable ? 'solid' : 'none',
                       borderWidth: 1,
                       borderColor: 'lightgray',
                   }}
            />

            <ImageBlockEditor value={imageBlockSpec}
                              onEdit={handleEdit}
                              onClose={closeEditor}
                              isOpen={isEditorOpen}/>
        </div>
    )
}