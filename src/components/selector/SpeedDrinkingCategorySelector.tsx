import React, {FC} from "react";
import {isValidNumber} from "~/utils/CommonValidators";
import {SpeedDrinkingCategory, speedDrinkingCategoryData} from "~/enums/SpeedDrinkingCategory";

interface Props {
    value: SpeedDrinkingCategory;
    onChange: (speedDrinkingCategory: SpeedDrinkingCategory) => void
}

const SpeedDrinkingCategorySelector: FC<Props> = (props) => {
    return (
        <div>
            <label>Category: </label>
            <select value={props.value}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (isValidNumber(val)) {
                            props.onChange(Number.parseInt(val) as SpeedDrinkingCategory);
                        }
                    }}>
                <option>Select a category...</option>
                {Object.values(speedDrinkingCategoryData).map(categoryDataEntry => {
                    return (
                        <option key={categoryDataEntry.category} value={categoryDataEntry.category}>
                            {categoryDataEntry.displayName}
                        </option>
                    );
                })}
            </select>
        </div>
    )
};

export default SpeedDrinkingCategorySelector;
