import React, {CSSProperties, FC, useState} from 'react'
import * as FileHostUtils from '~/utils/FileHostUtils'
import FullScreenImageModal from "~/components/image/FullScreenImageModal";

interface Props {
    fileId?: number;
    maxSize: number;
    overriddenOnClick?: (e) => void;
    forcedSrc?: string;
    alt?: string;
    imgStyles?: CSSProperties
}

const Image: FC<Props> = (props) => {
    const [isFullModalOpen, setIsFullModalOpen] = useState<boolean>(false);

    const smallImageSrc: string = props.forcedSrc ? props.forcedSrc : FileHostUtils.getUrlOfImage(props.fileId, props.maxSize)
    const fullScreenImageSrc: string = props.forcedSrc ? props.forcedSrc : FileHostUtils.getUrlOfImage(props.fileId, 2000)
    return (
        <>
            <img src={smallImageSrc}
                 onClick={(e) => {
                     if (props.overriddenOnClick) {
                         props.overriddenOnClick(e);
                     } else {
                         setIsFullModalOpen(true);
                     }
                 }}
                 alt={props.alt ? props.alt : "Couldn't load image :/"}
                 style={{
                     cursor: 'pointer',
                     maxWidth: props.maxSize,
                     maxHeight: props.maxSize,
                     ...(props.imgStyles ?? {}),
                 }}
            />
            <FullScreenImageModal
                isOpen={isFullModalOpen}
                onClose={() => setIsFullModalOpen(false)}
                src={fullScreenImageSrc}/>
        </>
    );
}

export default Image;