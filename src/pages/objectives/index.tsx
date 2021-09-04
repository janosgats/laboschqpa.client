import Head from 'next/head'
import { NextPage } from "next";
import React, { useState } from "react";
import ObjectivesPanel from "~/components/panel/ObjectivesPanel";
import { ObjectiveType } from "~/enums/ObjectiveType";
import { Box, Grid, Tab, Tabs, Typography } from '@material-ui/core';

const Index: NextPage = () => {
    const [filteredObjectiveTypes, setFilteredObjectiveTypes]
        = useState<Set<ObjectiveType>>(new Set([ObjectiveType.MAIN_OBJECTIVE]));

    const [selectedTab, setSelectedTab] = useState<ObjectiveType>(ObjectiveType.MAIN_OBJECTIVE);

    function updateFilteredObjectiveTypes(type: ObjectiveType, shouldDisplay: boolean) {
        if (shouldDisplay) {
            filteredObjectiveTypes.add(type);
        } else {
            filteredObjectiveTypes.delete(type);
        }
        setFilteredObjectiveTypes(new Set(filteredObjectiveTypes));
    }

    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setSelectedTab(newValue);
        filteredObjectiveTypes.clear();
        filteredObjectiveTypes.add(newValue);
        setFilteredObjectiveTypes(new Set(filteredObjectiveTypes));
    };

    return (
        <>
            <Head>
                <title>Feladatok</title>
            </Head>
            <Grid>
                <Box
                    style={{
                        padding: "24px",
                        
                    }}
                >
                    <Tabs
                        value={selectedTab}
                        onChange={handleChange}
                        centered
                        variant="fullWidth"
                        indicatorColor="secondary"
                        textColor="secondary"
                        aria-label="icon label tabs example"
                    >
                        <Tab label="Elő feladatok" value={ObjectiveType.PRE_WEEK_TASK} />
                        <Tab label="Feladatok" value={ObjectiveType.MAIN_OBJECTIVE} />
                        <Tab label="Acsík" value={ObjectiveType.ACHIEVEMENT} />
                    </Tabs>


                    <ObjectivesPanel filteredObjectiveTypes={Array.from(filteredObjectiveTypes)} />

                </Box>
            </Grid>

        </>
    )
};

export default Index;
