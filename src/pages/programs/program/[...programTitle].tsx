import {NextPage} from 'next';
import {useRouter} from 'next/router';
import React, {useContext, useState} from 'react';
import {UserNameContainer} from '~/model/UserInfo';
import ObjectivesBelongingToProgramPanel from "~/components/panel/ObjectivesBelongingToProgramPanel";
import {ProgramDisplayContainer} from "~/components/fetchableDisplay/FetchableDisplayContainer";
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import useEndpoint from "~/hooks/useEndpoint";
import Spinner from "~/components/Spinner";
import MyPaper from "~/components/mui/MyPaper";
import {prefixWordWithArticle} from "~/utils/wordPrefixingUtils";
import TeamScoreResponse from "~/model/TeamScoreResponse";
import {ObjectiveType} from '~/enums/ObjectiveType';
import {Grid, Tab, Tabs, Typography} from '@material-ui/core';
import {separatedPoints} from '~/pages/teams';

interface TeamMember extends UserNameContainer {
    userId: number;
    profilePicUrl: string;
    teamRole: number;
}

const Index: NextPage = () => {
    const router = useRouter();
    const programId = Number.parseInt(router.query['id'] as string);

    const currentUser = useContext(CurrentUserContext);


    const usedEndpoint = useEndpoint<TeamScoreResponse>({
        conf: {
            url: "/api/up/server/api/program/teamScore",
            method: "get",
            params: {
                teamId: currentUser.getUserInfo()?.teamId,
                programId: programId,
            },
        },
        deps: [currentUser.getUserInfo()?.teamId, programId],
        enableRequest: router.isReady && currentUser.isMemberOrLeaderOrApplicantOfAnyTeam(),
    });

    const [selectedTab, setSelectedTab] = useState(ObjectiveType.MAIN_OBJECTIVE)

    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setSelectedTab(newValue);
    };

    return (
        <>
            {router.isReady && (
                <>
                    <ProgramDisplayContainer entityId={programId} shouldCreateNew={false}/>
                    <br/>
                    <Grid>
                        <MyPaper>
                            {currentUser.isMemberOrLeaderOrApplicantOfAnyTeam() && (
                                <>
                                    {usedEndpoint.pending && <Spinner/>}
                                    {usedEndpoint.failed && <p>Couldn't load team score on this Program :/ </p>}
                                    {usedEndpoint.succeeded && (
                                        <Grid
                                            container
                                            justify="space-between"
                                            alignItems="center"
                                        >
                                            <Typography variant="h6">
                                                {prefixWordWithArticle(currentUser.getUserInfo()?.teamName, true)} pontszáma
                                                ezen a programon:
                                            </Typography>
                                            <Typography variant="h6">
                                                {separatedPoints(usedEndpoint.data.teamScore)}
                                            </Typography>
                                        </Grid>
                                    )}
                                </>
                            )}
                        </MyPaper>
                    </Grid>
                    <br/>
                    <Grid>
                        <MyPaper>
                            <Grid
                                container
                                justify="center"
                            >
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
                                <Tab label="Elő feladatok" value={ObjectiveType.PRE_WEEK_TASK}/>
                                <Tab label="Feladatok" value={ObjectiveType.MAIN_OBJECTIVE}/>
                                <Tab label="Acsík" value={ObjectiveType.ACHIEVEMENT}/>
                            </Tabs>
                        </MyPaper>
                    </Grid>

                    <ObjectivesBelongingToProgramPanel programId={programId} filteredObjectiveType={selectedTab}/>
                </>
            )}
        </>
    )
};

export default Index;
