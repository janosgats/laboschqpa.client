import {Container, Grid, Tab, Tabs, Typography} from '@material-ui/core';
import {NextPage} from 'next';
import {useRouter} from 'next/router';
import React, {useContext, useState} from 'react';
import {ProgramDisplayContainer} from '~/components/fetchableDisplay/FetchableDisplayContainer';
import MyPaper from '~/components/mui/MyPaper';
import ObjectivesBelongingToProgramPanel from '~/components/panel/ObjectivesBelongingToProgramPanel';
import Spinner from '~/components/Spinner';
import {CurrentUserContext} from '~/context/CurrentUserProvider';
import {ObjectiveType, objectiveTypeData} from '~/enums/ObjectiveType';
import useEndpoint from '~/hooks/useEndpoint';
import TeamScoreResponse from '~/model/TeamScoreResponse';
import {separatedPoints} from '~/pages/teams';
import {prefixWordWithArticle} from '~/utils/wordPrefixingUtils';
import TeamScoresOnProgramDisplay from "~/components/program/TeamScoresOnProgramDisplay";

interface ProgramPageContextProps {
    programId: number;
}

export const ProgramPageContext = React.createContext<ProgramPageContextProps>(null);

const Index: NextPage = () => {
    const router = useRouter();
    const programId = Number.parseInt(router.query['id'] as string);

    const currentUser = useContext(CurrentUserContext);

    const usedEndpoint = useEndpoint<TeamScoreResponse>({
        conf: {
            url: '/api/up/server/api/program/teamScore',
            method: 'get',
            params: {
                teamId: currentUser.getUserInfo()?.teamId,
                programId: programId,
            },
        },
        deps: [currentUser.getUserInfo()?.teamId, programId],
        enableRequest: router.isReady && currentUser.isMemberOrLeaderOrApplicantOfAnyTeam(),
    });

    const [selectedTab, setSelectedTab] = useState<ObjectiveType>(ObjectiveType.MAIN_OBJECTIVE);

    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        if (objectiveTypeData[newValue]) {
            setSelectedTab(newValue);
        } else {
            setSelectedTab(ObjectiveType.MAIN_OBJECTIVE);
        }
    };

    return (
        <Container maxWidth="lg">
            <ProgramPageContext.Provider value={{programId: programId}}>
                {router.isReady && (
                    <Grid container direction="column" spacing={2}>
                        <Grid item>
                            <ProgramDisplayContainer entityId={programId} shouldCreateNew={false} />
                        </Grid>
                        <Grid item>
                            {currentUser.isMemberOrLeaderOrApplicantOfAnyTeam() && (
                                <MyPaper>
                                    {usedEndpoint.pending && <Spinner />}
                                    {usedEndpoint.failed && <p>Couldn't load team score on this Program :/ </p>}
                                    {usedEndpoint.succeeded && (
                                        <Grid container justify="space-between" alignItems="center">
                                            <Typography variant="h6">
                                                {prefixWordWithArticle(currentUser.getUserInfo()?.teamName, true)} pontszáma ezen a
                                                programon:
                                            </Typography>
                                            <Typography variant="h6">{separatedPoints(usedEndpoint.data.teamScore)}</Typography>
                                        </Grid>
                                    )}
                                </MyPaper>
                            )}
                        </Grid>
                        <Grid style={{paddingTop: '2rem'}} item>
                            <MyPaper p={0} style={{paddingTop: '1rem'}}>
                                <Grid container style={{paddingTop: '1rem'}} justify="center">
                                    <Typography variant="subtitle1">Programhoz kapcsolódó feladatok</Typography>
                                </Grid>
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
                        </Grid>

                        <Grid item>
                            <ObjectivesBelongingToProgramPanel programId={programId} filteredObjectiveType={selectedTab} />
                        </Grid>

                        <Grid item>
                            <TeamScoresOnProgramDisplay programId={programId} />
                        </Grid>
                    </Grid>
                )}
            </ProgramPageContext.Provider>
        </Container>
    );
};

export default Index;
