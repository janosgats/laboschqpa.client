import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography,
} from '@material-ui/core';
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
import {FileSizeFormatter} from '~/utils/FileSizeFormatter';
import UserNameFormatter from '~/utils/UserNameFormatter';
import Responsive from '../Responsive';
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
    onClose: () => void;
}

const FileInfoModal: FC<Props> = ({onClose, fileId}) => {
    const currentUser = useContext(CurrentUserContext);
    const usedEndpoint: UsedEndpoint<FileInfo> = useEndpoint<FileInfo>({
        conf: {
            url: 'api/up/server/api/file/info',
            params: {
                id: fileId,
            },
        },
        deps: [fileId],
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
            return (
                <Box mx="auto" my={2} width="fit-content">
                    <Image fileId={fileInfo.id} maxSize={300} alt={fileInfo.name} />
                </Box>
            );
        }

        return <p>No preview is available</p>;
    };

    return (
        <Responsive component={Dialog} onClose={onClose} open={true}>
            <Box p={2}>
                <DialogTitle>
                    <Typography variant="h4">File info</Typography>
                </DialogTitle>
                <DialogContent>
                    {usedEndpoint.pending && <Spinner minWidth="10em" />}

                    {usedEndpoint.failed && (
                        <>
                            <p>Couldn't fetch file info :'(</p>
                            <button onClick={() => usedEndpoint.reloadEndpoint()}>Retry</button>
                        </>
                    )}
                    {usedEndpoint.succeeded && fileInfo && (
                        <>
                            {fileInfo.status === IndexedFileStatus.AVAILABLE ? (
                                <>
                                    <Table>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell>
                                                    <b>Id</b>
                                                </TableCell>
                                                <TableCell>{fileInfo.id}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>
                                                    <b>Mime</b>
                                                </TableCell>
                                                <TableCell>{fileInfo.mimeType}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>
                                                    <b>Name</b>
                                                </TableCell>
                                                <TableCell>{fileInfo.name}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>
                                                    <b>Owner user</b>
                                                </TableCell>
                                                <TableCell>
                                                    {getOwnerUserNameToDisplay()} ({fileInfo.ownerUserId})
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>
                                                    <b>Owner team</b>
                                                </TableCell>
                                                <TableCell>
                                                    {fileInfo.ownerTeamName} ({fileInfo.ownerTeamId})
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>
                                                    <b>Created At</b>
                                                </TableCell>
                                                <TableCell>{DateTimeFormatter.toFullBasic(fileInfo.creationTime)}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>
                                                    <b>Size</b>
                                                </TableCell>
                                                <TableCell>{FileSizeFormatter(fileInfo.size)}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                    <ImagePreview />
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
                </DialogContent>
                <DialogActions>
                    {isVisible && (
                        <>
                            <Button
                                component="a"
                                href={FileHostUtils.getUrlOfOriginalFile(fileInfo.id)}
                                target="_blank"
                                children="Download original"
                                color="primary"
                                variant="outlined"
                            />
                            <Button
                                component="a"
                                href={FileHostUtils.getUrlOfFile(fileInfo.id)}
                                target="_blank"
                                children="Download optimized"
                                color="primary"
                                variant="outlined"
                            />
                        </>
                    )}
                    {canUserEditFile() && (
                        <Button color="secondary" variant="outlined" onClick={onDeleteFileClick}>
                            Delete
                        </Button>
                    )}
                </DialogActions>
            </Box>
        </Responsive>
    );
};

export default FileInfoModal;
