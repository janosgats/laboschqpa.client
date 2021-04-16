import {FC} from "react";
import Entity from "~/model/Entity";

export interface FetchableDisplayProps<E extends Entity, S> {
    isCreatingNew: boolean;
    existingEntity: E;

    isApiCallPending: boolean;

    onSave: (command: S) => Promise<void>;
    onDelete: () => Promise<void>;
}

export interface FetchingTools<E extends Entity, S> {
    fetchEntity: (id: number) => Promise<E>;
    editEntity: (id: number, command: S) => Promise<any>;
    createNewEntity: (command: S) => Promise<number>;
    deleteEntity: (id: number) => Promise<any>;
}

export type FetchableDisplay<E extends Entity, S> = FC<FetchableDisplayProps<E, S>> & {
    fetchingTools: FetchingTools<E, S>
};