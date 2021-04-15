import {FC} from "react";

export interface FetchableDisplayProps<E, S> {
    isCreatingNew: boolean;
    existingEntity: E;

    isApiCallPending: boolean;

    onSave: (command: S) => Promise<void>;
    onDelete: () => Promise<void>;
}

export interface FetchingTools<E, S> {
    fetchEntity: (id: number) => Promise<E>;
    editEntity: (id: number, command: S) => Promise<any>;
    createNewEntity: (command: S) => Promise<number>;
    deleteEntity: (id: number) => Promise<any>;
}

export type FetchableDisplay<E, S> = FC<FetchableDisplayProps<E, S>> & {
    fetchingTools: FetchingTools<E, S>
};