import React, {FC} from "react";
import {isValidNumber} from "~/utils/CommonValidators";
import Select from "@material-ui/core/Select";
import MUIPaper from "@material-ui/core/Paper";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {RiddleCategory, riddleCategoryData} from "~/enums/RiddleCategory";

interface Props {
    value: RiddleCategory;
    onChange: (riddleCategory: RiddleCategory) => void;
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        categorySelectContainer: {
            padding: "10px",
        },
        categorySelect: {
            width: "120px",
        },
    })
);

const RiddleCategorySelector: FC<Props> = (props) => {
    const classes = useStyles();
    return (
        <MUIPaper className={classes.categorySelectContainer}>
            <InputLabel>Category </InputLabel>
            <Select
                value={props.value}
                className={classes.categorySelect}
                onChange={(e) => {
                    const val = e.target.value;
                    if (isValidNumber(val as string)) {
                        props.onChange(Number.parseInt(val as string) as RiddleCategory);
                    }
                }}
            >
                <MenuItem>Select a category...</MenuItem>
                {Object.values(riddleCategoryData).map((categoryDataEntry) => {
                    return (
                        <MenuItem
                            key={categoryDataEntry.category}
                            value={categoryDataEntry.category}
                        >
                            {categoryDataEntry.displayName}
                        </MenuItem>
                    );
                })}
            </Select>
        </MUIPaper>
    );
};

export default RiddleCategorySelector;
