import {Checkbox, Container, createStyles, FormControlLabel, makeStyles, Theme} from '@material-ui/core';
import {NextPage} from 'next';
import Head from 'next/head';
import React, {useState} from 'react';
import SpeedDrinkingPanel from '~/components/panel/SpeedDrinkingPanel';
import SpeedDrinkingCategorySelector from '~/components/selector/SpeedDrinkingCategorySelector';
import {SpeedDrinkingCategory} from '~/enums/SpeedDrinkingCategory';

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
        <Container maxWidth="xl">
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
        </Container>
    );
};

export default Index;
