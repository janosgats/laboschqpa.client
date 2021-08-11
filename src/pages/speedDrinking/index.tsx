import Head from "next/head";
import { NextPage } from "next";
import React, { useContext, useState } from "react";
import { SpeedDrinkingCategory } from "~/enums/SpeedDrinkingCategory";
import SpeedDrinkingPanel from "~/components/panel/SpeedDrinkingPanel";
import SpeedDrinkingCategorySelector from "~/components/selector/SpeedDrinkingCategorySelector";
import { CurrentUserContext } from "~/context/CurrentUserProvider";
import { createStyles, makeStyles, Theme } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    header: {
      marginBottom: "10px",
    },
  });
});

const Index: NextPage = () => {
  const classes = useStyles();

  const currentUser = useContext(CurrentUserContext);
  const [filteredCategory, setFilteredCategory] =
    useState<SpeedDrinkingCategory>(SpeedDrinkingCategory.BEER);

  return (
    <div>
      <Head>
        <title>Speed Drinking</title>
      </Head>
      <div className={classes.header}>
        <SpeedDrinkingCategorySelector
          value={filteredCategory}
          onChange={(category) => setFilteredCategory(category)}
        />
      </div>

      <div className={classes.table}>
        <SpeedDrinkingPanel filteredCategory={filteredCategory} />
      </div>
    </div>
  );
};

export default Index;
