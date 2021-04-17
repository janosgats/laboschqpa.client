export enum ObjectiveType {
    MAIN_OBJECTIVE = 1,
    PRE_WEEK_TASK = 2,
}

export interface ObjectiveTypeDataEntry {
    objectiveType: ObjectiveType;
    displayName: string;
    shortDisplayName: string;
}

export const objectiveTypeData: Record<ObjectiveType, ObjectiveTypeDataEntry> = {
    [ObjectiveType.MAIN_OBJECTIVE]: {
        objectiveType: ObjectiveType.MAIN_OBJECTIVE,
        displayName: "Main objective",
        shortDisplayName: "Main",
    },
    [ObjectiveType.PRE_WEEK_TASK]: {
        objectiveType: ObjectiveType.PRE_WEEK_TASK,
        displayName: "Pre-week task",
        shortDisplayName: "Pre-week",
    },
};
