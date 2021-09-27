import React, {FC, useState} from 'react'
import * as FileHostUtils from '~/utils/FileHostUtils'
import {Button, Dialog} from "@material-ui/core";
import MyPaper from "~/components/mui/MyPaper";
import useEndpoint from "~/hooks/useEndpoint";
import Spinner from "~/components/Spinner";
import Image from "~/components/image/Image";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import EventBus from "~/utils/EventBus";

interface ControlsInModalProps {
    originalFileId: number;
}

const ControlsInDialog: FC<ControlsInModalProps> = (props) => {

    const usedEndpoint = useEndpoint<number[]>({
        conf: {
            url: "/api/up/server/api/admin/file/listSucceededImageVariantIdsOfFile",
            params: {
                originalFileId: props.originalFileId,
            }
        }
    });

    function markVariantFileAsCorrupt(variantFileId: number) {
        callJsonEndpoint({
            conf: {
                url: '/api/up/server/api/admin/file/markImageVariantFileAsCorrupt',
                method: 'post',
                params: {
                    variantFileId: variantFileId
                }
            }
        }).then(() => {
            EventBus.notifySuccess(`variantFileId: ${variantFileId}`, 'Marked as corrupt');
        });
    }

    return (
        <MyPaper>
            {usedEndpoint.pending && <Spinner/>}
            {usedEndpoint.error && <button onClick={() => usedEndpoint.reloadEndpoint()}>Error. Retry?</button>}
            {usedEndpoint.succeeded && (
                <>
                    <p>Variants of {props.originalFileId}:
                        &nbsp;
                        <button onClick={() => usedEndpoint.reloadEndpoint()}>Reload all</button>
                    </p>
                    <ul>
                        {usedEndpoint.data.map(variantFileId => {
                            return (
                                <li>
                                    <p>variantFileId: {variantFileId}
                                        &nbsp;
                                        <button onClick={() => markVariantFileAsCorrupt(variantFileId)}>Mark as
                                            corrupt
                                        </button>
                                    </p>
                                    <Image maxSize={100}
                                           forcedSrc={FileHostUtils.getUrlOfOriginalFile(variantFileId)}
                                           alt={'alt variantFileId: ' + variantFileId}
                                    />
                                </li>
                            );
                        })}
                    </ul>
                </>
            )}
        </MyPaper>
    );
}

interface Props {
    originalFileId: number;
}

const ImageVariantSupervisor: FC<Props> = (props) => {
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    return (
        <div>
            <Button color="secondary" onClick={() => setIsDialogOpen(true)}>Check Variants</Button>

            <Dialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
            >
                <ControlsInDialog originalFileId={props.originalFileId}/>
            </Dialog>
        </div>
    );
}

export default ImageVariantSupervisor;