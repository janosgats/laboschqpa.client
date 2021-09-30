import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import RedeemIcon from '@material-ui/icons/Redeem';
import {OverridableComponent} from "@material-ui/core/OverridableComponent";
import {SvgIconTypeMap} from "@material-ui/core/SvgIcon/SvgIcon";

export enum ObjectiveType {
    MAIN_OBJECTIVE = 1,
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
        displayName: "Feladat",
        shortDisplayName: "Main",
        icon: AssignmentTurnedInIcon,
    },
    [ObjectiveType.ACHIEVEMENT]: {
        objectiveType: ObjectiveType.ACHIEVEMENT,
        displayName: "Acsi",
        shortDisplayName: "Acsi",
        icon: RedeemIcon,
    },
};
