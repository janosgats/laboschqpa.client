import React, { FC } from "react";
import { isValidNumber } from "~/utils/CommonValidators";
import {
  SpeedDrinkingCategory,
  speedDrinkingCategoryData,
} from "~/enums/SpeedDrinkingCategory";
import Select from "@material-ui/core/Select";
import MUIPaper from "@material-ui/core/Paper";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

interface Props {
  value: SpeedDrinkingCategory;
  onChange: (speedDrinkingCategory: SpeedDrinkingCategory) => void;
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

const SpeedDrinkingCategorySelector: FC<Props> = (props) => {
  const classes = useStyles();
  return (
    <MUIPaper className={classes.categorySelectContainer}>
      <InputLabel>Category </InputLabel>
      <Select
        value={props.value}
        className={classes.categorySelect}
        onChange={(e) => {
          const val = e.target.value;
          if (isValidNumber(val)) {
            props.onChange(Number.parseInt(val) as SpeedDrinkingCategory);
          }
        }}
      >
        <MenuItem>Select a category...</MenuItem>
        {Object.values(speedDrinkingCategoryData).map((categoryDataEntry) => {
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

export default SpeedDrinkingCategorySelector;
