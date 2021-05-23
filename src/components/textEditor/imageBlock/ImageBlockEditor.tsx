import React, {FC, useEffect, useState} from 'react'
import {EditImageCommand, ImageAlignment, ImageBlockSpec} from "~/components/textEditor/imageBlock/ImageBlockTypes";
import {Button, Dialog, DialogActions, DialogContent} from "@material-ui/core";


interface Props {
    value: ImageBlockSpec;
    onEdit: (editCommand: EditImageCommand) => void;
    onClose: () => void;
    isOpen: boolean;
}

/**
 * TODO: Add a clickable selector for alignment (instead of the text input)
 */
export const ImageBlockEditor: FC<Props> = (props) => {
    const [size, setSize] = useState<number>();
    const [alignment, setAlignment] = useState<ImageAlignment>();

    function handleEdit(): void {
        const editCommand: EditImageCommand = {
            size: size,
            alignment: alignment,
        };

        props.onEdit(editCommand);
    }

    useEffect(() => {
        if (props.isOpen) {
            setSize(props.value.size);
            setAlignment(props.value.alignment);
        }
    }, [props.isOpen])

    return (
        <Dialog open={props.isOpen} onClose={props.onClose}>
            <DialogContent>
                <label>Size:</label>
                <input type="number" value={size}
                       onChange={(e) => setSize(Number.parseInt(e.target.value))}
                       autoFocus/>
                <label>alignment:</label>
                <input value={alignment} onChange={(e) => setAlignment(e.target.value as ImageAlignment)}/>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose} color="secondary">
                    Cancel
                </Button>
                <Button onClick={handleEdit} color="primary">
                    Apply
                </Button>
            </DialogActions>
        </Dialog>
    )
}