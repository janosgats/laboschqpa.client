import React, {FC, useContext, useState} from 'react'
import ReactPlayer from 'react-player/lazy'
import {EditorContext} from "~/context/EditorContextProvider";
import {ReactPlayerBlockEditor} from "~/components/textEditor/reactPlayerBlock/ReactPlayerBlockEditor";
import {Button, Grid, GridJustification} from "@material-ui/core";

export interface ReactPlayerBlockSpec {
    url: string;
    hideControls: boolean;
    width: number;
    height: number;
    justification: GridJustification;
}

interface Props {
    blockProps: ReactPlayerBlockSpec;
}

export const ReactPlayerBlock: FC<Props> = (props) => {
    const spec: ReactPlayerBlockSpec = props.blockProps;
    const editorContext = useContext(EditorContext);

    const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false)

    function openEditor(): void {
        setIsEditorOpen(true)
        editorContext.setIsMuiRteReadonly(true);
    }

    function closeEditor(): void {
        setIsEditorOpen(false)
        editorContext.setIsMuiRteReadonly(false);
    }

    function handleEdit(newSpec: ReactPlayerBlockSpec): void {
        closeEditor();
        spec.url = newSpec.url;
        spec.hideControls = newSpec.hideControls;
        spec.width = newSpec.width;
        spec.height = newSpec.height;
        spec.justification = newSpec.justification;
    }

    return (
        <Grid container
              direction="column">
            <Grid item
                  container
                  justify={spec.justification}>
                <ReactPlayer
                    url={spec.url}
                    controls={!spec.hideControls}
                    width={spec.width}
                    height={spec.height}
                />
            </Grid>
            {editorContext.areSubcomponentsEditable && (
                <Grid item
                      container
                      justify='center'>
                    <Button color="secondary" onClick={openEditor}>Edit Embedded Video</Button>
                </Grid>
            )}

            <ReactPlayerBlockEditor
                value={spec}
                onEdit={handleEdit}
                isOpen={isEditorOpen}
                onClose={closeEditor}
            />
        </Grid>
    )
}