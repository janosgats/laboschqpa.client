import React, {FC, useContext} from 'react';
import Image from '~/components/image/Image';
import {CurrentUserContext} from '~/context/CurrentUserProvider';
import {content_CONTENT_IS_NOT_FOUND} from '~/enums/ApiErrors';
import {IndexedFileStatus, indexedFileStatusData} from '~/enums/IndexedFileStatus';
import {TeamRole} from '~/enums/TeamRole';
import ApiErrorDescriptorException from '~/exception/ApiErrorDescriptorException';
import useEndpoint, {UsedEndpoint} from '~/hooks/useEndpoint';
import {UserNameContainer} from '~/model/UserInfo';
import callJsonEndpoint from '~/utils/api/callJsonEndpoint';
import {getSurelyDate} from '~/utils/DateHelpers';
import DateTimeFormatter from '~/utils/DateTimeFormatter';
import EventBus from '~/utils/EventBus';
import * as FileHostUtils from '~/utils/FileHostUtils';
import UserNameFormatter from '~/utils/UserNameFormatter';
import Spinner from '../Spinner';

interface FileInfo {
    id: number;
    name: string;
    status: IndexedFileStatus;
    ownerUserId: number;
    ownerTeamId: number;
    creationTime: Date | string;
    mimeType: string;
    size: number;

    isVisibleForUser: boolean;

    ownerUserFirstName: string;
    ownerUserLastName: string;
    ownerUserNickName: string;
    ownerTeamName: string;
}

interface Props {
    fileId: number;
}

const FileInfoModal: FC<Props> = (props) => {
    const currentUser = useContext(CurrentUserContext);
    const usedEndpoint: UsedEndpoint<FileInfo> = useEndpoint<FileInfo>({
        conf: {
            url: 'api/up/server/api/file/info',
            params: {
                id: props.fileId,
            },
        },
        deps: [props.fileId],
        customSuccessProcessor: (axiosResponse) => {
            const data = axiosResponse.data;
            if (data.creationTime) {
                data.creationTime = getSurelyDate(data.creationTime);
            }
            return data;
        },
        onError: (err) => {
            if (err instanceof ApiErrorDescriptorException) {
                if (content_CONTENT_IS_NOT_FOUND.is(err.apiErrorDescriptor)) {
                    EventBus.notifyError('The file does not exist', 'File Not Found');
                }
            }
        },
    });

    const fileInfo: FileInfo = usedEndpoint.data;
    const isImage: boolean = !!fileInfo?.mimeType?.startsWith('image/');
    const isVisible: boolean = !!fileInfo?.isVisibleForUser;

    function onDeleteFileClick() {
        const surelyDelete: boolean = confirm('Do you want to delete this file?');
        if (!surelyDelete) {
            return;
        }

        callJsonEndpoint({
            conf: {
                url: '/api/up/server/api/file/delete',
                method: 'DELETE',
                params: {
                    id: fileInfo.id,
                },
            },
        })
            .then((res) => EventBus.notifySuccess(`${fileInfo.name} (${fileInfo.id})`, 'File deleted'))
            .catch(() => EventBus.notifyError(`Error while deleting the file`, 'Cannot deleted file'));
    }

    function canUserEditFile() {
        if (!currentUser.getUserInfo() || !fileInfo) {
            return false;
        }

        if (currentUser.getUserInfo().userId === fileInfo.ownerUserId) {
            return true;
        }
        if (currentUser.getUserInfo().teamRole === TeamRole.LEADER && currentUser.getUserInfo().teamId === fileInfo.ownerTeamId) {
            return true;
        }
        return false;
    }

    function getOwnerUserNameToDisplay() {
        if (!fileInfo) {
            return 'Pending...';
        }

        const container: UserNameContainer = {
            firstName: fileInfo.ownerUserFirstName,
            lastName: fileInfo.ownerUserLastName,
            nickName: fileInfo.ownerUserNickName,
        };

        return UserNameFormatter.getBasicDisplayName(container);
    }

    const ImagePreview: FC<{}> = () => {
        if (!isVisible) {
            return <p style={{color: 'red'}}>You're not authorized to view this file</p>;
        }

        if (isImage) {
            return <Image fileId={fileInfo.id} maxSize={300} alt={fileInfo.name} />;
        }

        return <p>No preview is available</p>;
    };

    return (
        <div style={{borderStyle: 'dashed', borderColor: 'green', borderWidth: 1}}>
            <p>TODO: This should be a modal</p>
            {usedEndpoint.pending && <Spinner />}

            {usedEndpoint.failed && (
                <>
                    <p>Couldn't fetch file info :'(</p>
                    <button onClick={() => usedEndpoint.reloadEndpoint()}>Retry</button>
                </>
            )}
            {fileInfo && (
                <>
                    {fileInfo.status === IndexedFileStatus.AVAILABLE ? (
                        <>
                            <p>ID: {fileInfo.id}</p>
                            <p>Mime: {fileInfo.mimeType}</p>
                            <ImagePreview />
                            <p>Name: {fileInfo.name}</p>

                            <p>
                                Owner user: {getOwnerUserNameToDisplay()} ({fileInfo.ownerUserId})
                            </p>
                            <p>
                                Owner team: {fileInfo.ownerTeamName} ({fileInfo.ownerTeamId})
                            </p>

                            <p>Created at: {DateTimeFormatter.toFullBasic(fileInfo.creationTime)}</p>

                            <p>Size: {fileInfo.size}</p>
                            {isVisible && (
                                <>
                                    <a href={FileHostUtils.getUrlOfOriginalFile(fileInfo.id)} target="_blank">
                                        <button>Download original</button>
                                    </a>
                                    <a href={FileHostUtils.getUrlOfFile(fileInfo.id)} target="_blank">
                                        <button>Download optimized</button>
                                    </a>
                                </>
                            )}

                            {canUserEditFile() && (
                                <>
                                    <button onClick={onDeleteFileClick}>Delete this file</button>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <h3>This file is not available atm.</h3>
                            <p>
                                Current status: <b>{indexedFileStatusData[fileInfo.status]?.displayName}</b>
                            </p>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default FileInfoModal;
