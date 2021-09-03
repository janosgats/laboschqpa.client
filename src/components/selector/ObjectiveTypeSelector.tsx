import { MenuItem, Select } from "@material-ui/core";
import React, { FC } from "react";
import { ObjectiveType, objectiveTypeData } from "~/enums/ObjectiveType";
import { isValidNumber } from "~/utils/CommonValidators";

interface Props {
    value: ObjectiveType;
    onChange: (objectiveType: ObjectiveType) => void
}

const ObjectiveTypeSelector: FC<Props> = (props) => {
    return (

        <Select value={props.value}
            onChange={(e) => {
                const val = e.target.value;
                if (isValidNumber(val as string)) {
                    props.onChange(Number.parseInt(val as string) as ObjectiveType);
                }
            }}
            label="Feladat típus"
            style={{width: "120px"}}
        >

            {Object.values(objectiveTypeData).map(objectiveTypeDataEntry => {
                return (
                    <MenuItem key={objectiveTypeDataEntry.objectiveType} value={objectiveTypeDataEntry.objectiveType}>
                        {objectiveTypeDataEntry.displayName}
                    </MenuItem>
                );
            })}
        </Select>

    )
};

export default ObjectiveTypeSelector;
