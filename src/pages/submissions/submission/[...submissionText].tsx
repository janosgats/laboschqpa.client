import {Container, Grid, Typography} from '@material-ui/core';
import {NextPage} from 'next';
import {useRouter} from 'next/router';
import React from 'react';
import {
    ObjectiveDisplayContainer,
    SubmissionDisplayContainer
} from '~/components/fetchableDisplay/FetchableDisplayContainer';
import Spinner from '~/components/Spinner';
import useEndpoint from '~/hooks/useEndpoint';
import {Submission} from "~/model/usergeneratedcontent/Submission";
import {Objective} from "~/model/usergeneratedcontent/Objective";


const SubmissionText: NextPage = () => {
    const router = useRouter();
    const submissionId = Number.parseInt(router.query['id'] as string);

    const usedSubmission = useEndpoint<Submission>({
        conf: {
            url: '/api/up/server/api/submission/submission',
            method: 'get',
            params: {
                id: submissionId,
            },
        },
        deps: [submissionId],
        enableRequest: router.isReady,
    });

    const usedObjective = useEndpoint<Objective>({
        conf: {
            url: '/api/up/server/api/objective/objective',
            method: 'get',
            params: {
                id: usedSubmission.data?.objectiveId,
            },
        },
        deps: [usedSubmission.data?.objectiveId],
        enableRequest: usedSubmission.succeeded && !!usedSubmission.data?.objectiveId,
    });


    return (
        <Container maxWidth="lg">
            {usedSubmission.pending || usedObjective.pending && <Spinner/>}
            {usedSubmission.failed && <p>Couldn't load submission :/</p>}
            {usedObjective.failed && <p>Couldn't load objective :/</p>}

            <Grid container direction="column" spacing={4}>

                {usedSubmission.succeeded && (
                    <Grid item>
                        <SubmissionDisplayContainer
                            overriddenBeginningEntity={usedSubmission.data}
                            shouldCreateNew={false}
                            displayExtraProps={{
                                showObjectiveTitle: false,
                                showTeamName: true,
                            }}
                        />
                    </Grid>
                )}

                {usedObjective.succeeded && (
                    <Grid item container direction="column" spacing={2}>
                        <Grid item>
                            <Typography variant="h4">Feladat</Typography>
                        </Grid>
                        <Grid item spacing={2}>
                            <ObjectiveDisplayContainer
                                overriddenBeginningEntity={usedObjective.data}
                                shouldCreateNew={false}
                            />
                        </Grid>
                    </Grid>
                )}
            </Grid>
        </Container>
    );
};

export default SubmissionText;
