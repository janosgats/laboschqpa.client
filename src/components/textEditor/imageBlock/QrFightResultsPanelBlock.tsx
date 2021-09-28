import React, {FC} from 'react'
import {ImageBlockSpec} from "~/components/textEditor/imageBlock/ImageBlockTypes";
import QrFightResultsPanel from "~/components/panel/QrFightResultsPanel";

interface Props {
    blockProps: ImageBlockSpec;
}

export const QrFightResultsPanelBlock: FC<Props> = (props) => {
    return (
        <div>
            <QrFightResultsPanel/>
        </div>
    )
}