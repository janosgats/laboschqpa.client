import {Box, Container, Grid, Tab, Tabs} from '@material-ui/core';
import {NextPage} from 'next';
import Head from 'next/head';
import React, {useState} from 'react';
import MyPaper from '~/components/mui/MyPaper';
import ObjectivesPanel from '~/components/panel/ObjectivesPanel';
import {ObjectiveType} from '~/enums/ObjectiveType';

const Index: NextPage = () => {
    const [filteredObjectiveTypes, setFilteredObjectiveTypes] = useState<Set<ObjectiveType>>(new Set([ObjectiveType.MAIN_OBJECTIVE]));

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
        <Container maxWidth="lg">
            <Head>
                <title>Feladatok</title>
            </Head>
            <Grid>
                <Box
                    style={{
                        padding: '24px',
                    }}
                >
                    <MyPaper
                        style={{marginBottom: '4px'}}
                    >
                        <Tabs
                            value={selectedTab}
                            onChange={handleChange}
                            centered
                            variant="fullWidth"
                            indicatorColor="secondary"
                            textColor="secondary"
                        >
                            <Tab label="Feladatok" value={ObjectiveType.MAIN_OBJECTIVE} />
                            <Tab label="Acsik" value={ObjectiveType.ACHIEVEMENT} />
                        </Tabs>
                    </MyPaper>

                    <ObjectivesPanel filteredObjectiveTypes={Array.from(filteredObjectiveTypes)} />
                </Box>
            </Grid>
        </Container>
    );
};

export default Index;
