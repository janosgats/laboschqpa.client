import React, {FC, useEffect, useState} from 'react'
import {FetchableDisplay} from "~/model/FetchableDisplay";
import EventBus from "~/utils/EventBus";
import {CircularProgress} from "@material-ui/core";
import {ErrorBoundary} from "react-error-boundary";
import Entity from "~/model/Entity";

interface Props<E extends Entity, S> {
    entityId?: number;
    overriddenBeginningEntity?: E;
    shouldCreateNew: boolean;
    displayComponent: FetchableDisplay<E, S>;
}

const FetchableDisplayContainer: FC<Props<Entity, unknown>> = <E extends Entity, S>(props: Props<E, S>) => {
    const WrappedDisplay = props.displayComponent;

    const [isCreatingNew, setIsCreatingNew] = useState<boolean>(props.shouldCreateNew);
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

        await WrappedDisplay.fetchingTools.fetchEntity(id)
            .then(fetchedEntity => setEntity(fetchedEntity))
            .catch((e) => setRetrieveError(true))
            .finally(() => {
                setIsUnderRetrieval(false);
                setIsPendingApiCall(false);
            });
    }

    async function doSaveAndGetIdToRetrieve(command: S): Promise<number> {
        if (isCreatingNew) {
            const idToRetrieve = await WrappedDisplay.fetchingTools.createNewEntity(command)
                .then(id => {
                    setEntityId(id);
                    return id;
                })
                .catch((e) => {
                    EventBus.notifyError('Error while creating content');
                    throw e;
                });
            setIsCreatingNew(false);

            return idToRetrieve;
        }

        await WrappedDisplay.fetchingTools.editEntity(entityId, command)
            .catch((e) => {
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
        } catch (ignored) {

        } finally {
            setIsPendingApiCall(false);
        }
    }

    async function handleOnDelete(): Promise<void> {
        setIsPendingApiCall(true);
        await WrappedDisplay.fetchingTools.deleteEntity(entityId)
            .then(() => setIsDeleted(true))
            .finally(() => setIsPendingApiCall(false));
    }

    return (
        <>
            {isDeleted && (
                <p style={{color: 'red'}}>Entity was deleted</p>
            )}

            {(!isDeleted) && (
                <>
                    {isUnderRetrieval && (
                        <CircularProgress size={250}/>
                    )}
                    {retrieveError && (
                        <>
                            <p>Cannot retrieve entity :'(</p>
                            <button onClick={() => retrieveEntity(entityId)}>Retry</button>
                        </>
                    )}
                    {(!retrieveError) && (!isUnderRetrieval) && (entity || isCreatingNew) && (
                        <ErrorBoundary fallback={<p>Cannot display entity :'(</p>}>
                            <WrappedDisplay
                                existingEntity={entity}
                                isCreatingNew={isCreatingNew}
                                isApiCallPending={pendingApiCall}
                                onSave={handleOnSave}
                                onDelete={handleOnDelete}
                            />
                        </ErrorBoundary>
                    )}
                </>
            )}
        </>
    )
}

export default FetchableDisplayContainer;