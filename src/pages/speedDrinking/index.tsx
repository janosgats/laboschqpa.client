import Head from 'next/head';
import {NextPage} from 'next';
import React, {useState} from 'react';
import {SpeedDrinkingCategory} from '~/enums/SpeedDrinkingCategory';
import SpeedDrinkingPanel from '~/components/panel/SpeedDrinkingPanel';
import SpeedDrinkingCategorySelector from '~/components/selector/SpeedDrinkingCategorySelector';
import {Checkbox, createStyles, FormControlLabel, makeStyles, Theme} from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => {
    return createStyles({
        header: {
            marginBottom: '10px',
        },
    });
});

const Index: NextPage = () => {
    const classes = useStyles();

    const [filteredCategory, setFilteredCategory] = useState<SpeedDrinkingCategory>(SpeedDrinkingCategory.BEER);
    const [onlyShowPersonalBests, setOnlyShowPersonalBests] = useState<boolean>(true);

    return (
        <div>
            <Head>
                <title>Sörmérés</title>
            </Head>
            <div className={classes.header}>
                <SpeedDrinkingCategorySelector value={filteredCategory} onChange={(category) => setFilteredCategory(category)} />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={onlyShowPersonalBests}
                            onChange={(e) => setOnlyShowPersonalBests(e.target.checked)}
                            color="primary"
                        />
                    }
                    labelPlacement="start"
                    label="Csak az egyéni legjobb időket mutasd: "
                />
            </div>

            <SpeedDrinkingPanel filteredCategory={filteredCategory} onlyShowPersonalBests={onlyShowPersonalBests} />
        </div>
    );
};

export default Index;
