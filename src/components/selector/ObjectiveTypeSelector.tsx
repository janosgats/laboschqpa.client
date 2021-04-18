import React, {FC} from "react";
import {ObjectiveType, objectiveTypeData} from "~/enums/ObjectiveType";
import {isValidNumber} from "~/utils/CommonValidators";

interface Props {
    value: ObjectiveType;
    onChange: (objectiveType: ObjectiveType) => void
}

const ObjectiveTypeSelector: FC<Props> = (props) => {
    return (
        <div>
            <label>Objective type: </label>
            <select value={props.value}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (isValidNumber(val)) {
                            props.onChange(Number.parseInt(val) as ObjectiveType);
                        }
                    }}>
                <option>Select a type...</option>
                {Object.values(objectiveTypeData).map(objectiveTypeDataEntry => {
                    return (
                        <option key={objectiveTypeDataEntry.objectiveType} value={objectiveTypeDataEntry.objectiveType}>
                            {objectiveTypeDataEntry.displayName}
                        </option>
                    );
                })}
            </select>
        </div>
    )
};

export default ObjectiveTypeSelector;
