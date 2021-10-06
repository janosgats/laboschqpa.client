import React, {CSSProperties, FC, useContext, useState} from 'react'
import * as FileHostUtils from '~/utils/FileHostUtils'
import FullScreenImageModal from "~/components/image/FullScreenImageModal";
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import {Authority} from "~/enums/Authority";
import ImageVariantSupervisor from "~/components/image/ImageVariantSupervisor";

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

    const currentUser = useContext(CurrentUserContext);
    const isFromFileHost = !props.forcedSrc;

    const smallImageSrc: string = isFromFileHost ? FileHostUtils.getUrlOfImage(props.fileId, props.maxSize) : props.forcedSrc;
    const fullScreenImageSrc: string = isFromFileHost ? FileHostUtils.getUrlOfImage(props.fileId, 2000) : props.forcedSrc;
    return (
        <>
            <div>
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
                {isFromFileHost && currentUser.hasAuthority(Authority.FileSupervisor) && (
                    <>
                        <ImageVariantSupervisor originalFileId={props.fileId}/>
                    </>
                )}
            </div>
        </>
    );
}

export default Image;