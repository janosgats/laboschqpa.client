import {CircularProgress} from '@material-ui/core';
import React, {FC, useEffect, useState} from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import NewsPostDisplay from '~/components/fetchableDisplay/NewsPostDisplay';
import ObjectiveDisplay from '~/components/fetchableDisplay/ObjectiveDisplay';
import SpeedDrinkingDisplay, {SpeedDrinkingDisplayExtraProps} from '~/components/fetchableDisplay/SpeedDrinkingDisplay';
import SubmissionDisplay, {SubmissionDisplayExtraProps} from '~/components/fetchableDisplay/SubmissionDisplay';
import Entity from '~/model/Entity';
import {FetchableDisplay} from '~/model/FetchableDisplay';
import {NewsPost} from '~/model/usergeneratedcontent/NewsPost';
import {Objective} from '~/model/usergeneratedcontent/Objective';
import {SpeedDrinking} from '~/model/usergeneratedcontent/SpeedDrinking';
import {Submission} from '~/model/usergeneratedcontent/Submission';
import EventBus from '~/utils/EventBus';

interface CallbackProps {
    onCreatedNew?: (createdId: number) => void;
    onCancelledNewCreation?: () => void;
}

interface Props<E extends Entity, S, P extends Record<string, any>> extends CallbackProps {
    entityId?: number;
    overriddenBeginningEntity?: E;
    shouldCreateNew: boolean;
    displayComponent: FetchableDisplay<E, S, P>;
    displayExtraProps?: P;
}

const FetchableDisplayContainer: FC<Props<Entity, unknown, Record<string, any>>> = <E extends Entity, S, P extends Record<string, any>>(
    props: Props<E, S, P>
) => {
    const WrappedDisplay: FetchableDisplay<E, S, P> = props.displayComponent;

    const [isCreatingNew, setIsCreatingNew] = useState<boolean>(props.shouldCreateNew);
    const [isCancelledNewCreation, setIsCancelledNewCreation] = useState<boolean>(false);
    const [entityId, setEntityId] = useState<number>(props.entityId);

    const [pendingApiCall, setIsPendingApiCall] = useState<boolean>(false);
    const [isUnderRetrieval, setIsUnderRetrieval] = useState<boolean>(false);
    const [retrieveError, setRetrieveError] = useState<boolean>(false);
    const [entity, setEntity] = useState<E>(null);
    const [isDeleted, setIsDeleted] = useState<boolean>(false);

    useEffect(() => {
        if (isCreatingNew) {
            return;
        }

        if (props.overriddenBeginningEntity) {
            setEntityId(props.overriddenBeginningEntity.id);
            setEntity(props.overriddenBeginningEntity);
        } else {
            setEntityId(props.entityId);
            retrieveEntity(props.entityId);
        }
    }, [props.entityId, props.overriddenBeginningEntity]);

    async function retrieveEntity(id: number): Promise<void> {
        setRetrieveError(false);
        setEntity(null);
        setIsPendingApiCall(true);
        setIsUnderRetrieval(true);

        await WrappedDisplay.fetchingTools
            .fetchEntity(id)
            .then((fetchedEntity) => setEntity(fetchedEntity))
            .catch((e) => setRetrieveError(true))
            .finally(() => {
                setIsUnderRetrieval(false);
                setIsPendingApiCall(false);
            });
    }

    async function doSaveAndGetIdToRetrieve(command: S): Promise<number> {
        if (isCreatingNew) {
            const createdId = await WrappedDisplay.fetchingTools
                .createNewEntity(command)
                .then((id) => {
                    setEntityId(id);
                    return id;
                })
                .catch((e) => {
                    EventBus.notifyError('Error while creating content');
                    throw e;
                });
            setIsCreatingNew(false);
            if (props.onCreatedNew) {
                props.onCreatedNew(createdId);
            }
            return createdId;
        }

        await WrappedDisplay.fetchingTools.editEntity(entityId, command).catch((e) => {
            EventBus.notifyError('Error while editing content');
            throw e;
        });
        return entityId;
    }

    async function handleOnSave(command: S): Promise<void> {
        try {
            setIsPendingApiCall(true);
            const idToRetrieve = await doSaveAndGetIdToRetrieve(command);
            await retrieveEntity(idToRetrieve);
        } catch (e) {
            throw e;
        } finally {
            setIsPendingApiCall(false);
        }
    }

    async function handleOnDelete(): Promise<void> {
        setIsPendingApiCall(true);
        await WrappedDisplay.fetchingTools
            .deleteEntity(entityId)
            .then(() => setIsDeleted(true))
            .finally(() => setIsPendingApiCall(false));
    }

    function handleOnCancelEditing(): void {
        if (isCreatingNew) {
            setIsCancelledNewCreation(true);
            if (props.onCancelledNewCreation) {
                props.onCancelledNewCreation();
            }
        }
    }

    return (
        <>
            {isDeleted && <p>Entity was deleted</p>}

            {/*isCancelledNewCreation && (
                <p>Entity creation was cancelled</p>
            )*/}

            {!isDeleted && !isCancelledNewCreation && (
                <>
                    {isUnderRetrieval && <CircularProgress size={250} />}
                    {retrieveError && (
                        <>
                            <p>Cannot retrieve entity :'(</p>
                            <button onClick={() => retrieveEntity(entityId)}>Retry</button>
                        </>
                    )}
                    {!retrieveError && !isUnderRetrieval && (entity || isCreatingNew) && (
                        <ErrorBoundary fallback={<p>Cannot display entity :'(</p>}>
                            <WrappedDisplay
                                existingEntity={entity}
                                isCreatingNew={isCreatingNew}
                                isApiCallPending={pendingApiCall}
                                onSave={handleOnSave}
                                onDelete={handleOnDelete}
                                onCancelEditing={handleOnCancelEditing}
                                {...(props.displayExtraProps ? props.displayExtraProps : ({} as P))}
                            />
                        </ErrorBoundary>
                    )}
                </>
            )}
        </>
    );
};

interface NewsPostDisplayContainerProps extends CallbackProps {
    entityId?: number;
    overriddenBeginningEntity?: NewsPost;
    shouldCreateNew: boolean;
}

export const NewsPostDisplayContainer: FC<NewsPostDisplayContainerProps> = (props) => {
    return (
        <FetchableDisplayContainer
            displayComponent={NewsPostDisplay}
            shouldCreateNew={props.shouldCreateNew}
            entityId={props.entityId}
            overriddenBeginningEntity={props.overriddenBeginningEntity}
            onCreatedNew={props.onCreatedNew}
            onCancelledNewCreation={props.onCancelledNewCreation}
        />
    );
};

interface ObjectiveDisplayContainerProps extends CallbackProps {
    entityId?: number;
    overriddenBeginningEntity?: Objective;
    shouldCreateNew: boolean;
}

export const ObjectiveDisplayContainer: FC<ObjectiveDisplayContainerProps> = (props) => {
    return (
        <FetchableDisplayContainer
            displayComponent={ObjectiveDisplay}
            shouldCreateNew={props.shouldCreateNew}
            entityId={props.entityId}
            overriddenBeginningEntity={props.overriddenBeginningEntity}
            onCreatedNew={props.onCreatedNew}
            onCancelledNewCreation={props.onCancelledNewCreation}
        />
    );
};

interface SubmissionDisplayContainerProps extends CallbackProps {
    entityId?: number;
    overriddenBeginningEntity?: Submission;
    shouldCreateNew: boolean;
    displayExtraProps: SubmissionDisplayExtraProps;
}

export const SubmissionDisplayContainer: FC<SubmissionDisplayContainerProps> = (props) => {
    return (
        <FetchableDisplayContainer
            displayComponent={SubmissionDisplay}
            shouldCreateNew={props.shouldCreateNew}
            displayExtraProps={props.displayExtraProps}
            entityId={props.entityId}
            overriddenBeginningEntity={props.overriddenBeginningEntity}
            onCreatedNew={props.onCreatedNew}
            onCancelledNewCreation={props.onCancelledNewCreation}
        />
    );
};

interface SpeedDrinkingDisplayContainerProps extends CallbackProps {
    entityId?: number;
    overriddenBeginningEntity?: SpeedDrinking;
    shouldCreateNew: boolean;
    displayExtraProps: SpeedDrinkingDisplayExtraProps;
}

export const SpeedDrinkingDisplayContainer: FC<SpeedDrinkingDisplayContainerProps> = (props) => {
    return (
        <FetchableDisplayContainer
            displayComponent={SpeedDrinkingDisplay}
            shouldCreateNew={props.shouldCreateNew}
            displayExtraProps={props.displayExtraProps}
            entityId={props.entityId}
            overriddenBeginningEntity={props.overriddenBeginningEntity}
            onCreatedNew={props.onCreatedNew}
            onCancelledNewCreation={props.onCancelledNewCreation}
        />
    );
};
