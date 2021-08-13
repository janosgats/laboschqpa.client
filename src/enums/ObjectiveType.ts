import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck';
import RedeemIcon from '@material-ui/icons/Redeem';
import {OverridableComponent} from "@material-ui/core/OverridableComponent";
import {SvgIconTypeMap} from "@material-ui/core/SvgIcon/SvgIcon";

export enum ObjectiveType {
    MAIN_OBJECTIVE = 1,
    PRE_WEEK_TASK = 2,
    ACHIEVEMENT = 3,
}

export interface ObjectiveTypeDataEntry {
    objectiveType: ObjectiveType;
    displayName: string;
    shortDisplayName: string;
    icon: OverridableComponent<SvgIconTypeMap>;
}

export const objectiveTypeData: Record<ObjectiveType, ObjectiveTypeDataEntry> = {
    [ObjectiveType.MAIN_OBJECTIVE]: {
        objectiveType: ObjectiveType.MAIN_OBJECTIVE,
        displayName: "Main objective",
        shortDisplayName: "Main",
        icon: AssignmentTurnedInIcon,
    },
    [ObjectiveType.PRE_WEEK_TASK]: {
        objectiveType: ObjectiveType.PRE_WEEK_TASK,
        displayName: "Pre-week task",
        shortDisplayName: "Pre-week",
        icon: PlaylistAddCheckIcon,
    },
    [ObjectiveType.ACHIEVEMENT]: {
        objectiveType: ObjectiveType.ACHIEVEMENT,
        displayName: "Achievement",
        shortDisplayName: "Achi",
        icon: RedeemIcon,
    },
};
