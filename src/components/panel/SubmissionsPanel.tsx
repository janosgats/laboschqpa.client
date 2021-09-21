import {Button, createStyles, Grid, makeStyles, Paper, Theme, Typography} from '@material-ui/core';
import React, {FC, useState} from 'react';
import {SubmissionDisplayContainer} from '~/components/fetchableDisplay/FetchableDisplayContainer';
import useEndpoint from '~/hooks/useEndpoint';
import useInfiniteScroller, {InfiniteScroller} from '~/hooks/useInfiniteScroller';
import {Submission} from '~/model/usergeneratedcontent/Submission';
import {isValidNumber} from '~/utils/CommonValidators';
import Spinner from '../Spinner';
import {styles} from './styles/SubmissionsPanelStyle';

interface Props {
    filteredObjectiveId?: number;
    filteredTeamId?: number;
}

const useStyles = makeStyles((theme: Theme) => createStyles(styles));

const SubmissionsPanel: FC<Props> = (props) => {
    const infiniteScroller: InfiniteScroller = useInfiniteScroller({
        startingShowCount: 3,
    });

    const classes = useStyles();

    const [objectiveSubmissionMap, setObjectiveSubmissionMap] = useState<Map<number, Submission[]>>(null);

    const [objectivesIdList, setObjectivesIdList] = useState<number[]>(null);

    const usedEndpoint = useEndpoint<Submission[]>({
        conf: {
            url: '/api/up/server/api/submission/display/list',
            method: 'post',
            data: {
                objectiveId: props.filteredObjectiveId,
                teamId: props.filteredTeamId,
            },
        },
        deps: [props.filteredObjectiveId, props.filteredTeamId],
        onSuccess: (res) => {
            infiniteScroller.setMaxLength(res.data.length);
            const tempHashMap = new Map();
            const tempObjectives = [];
            res.data.map((submission: Submission) => {
                if (tempHashMap.has(submission.objectiveId)) {
                    let tempList: Submission[] = tempHashMap.get(submission.objectiveId);
                    tempList = [...tempList, submission];
                    tempHashMap.set(submission.objectiveId, tempList);
                } else {
                    tempHashMap.set(submission.objectiveId, [submission]);
                    tempObjectives.push(submission.objectiveId);
                }
            });
            setObjectiveSubmissionMap(tempHashMap);
            setObjectivesIdList(tempObjectives);
        },
    });

    return (
        <div>
            {usedEndpoint.pending && <Spinner />}
            {usedEndpoint.failed && <p>Couldn't load submissions :'(</p>}

            {usedEndpoint.succeeded && (
                <>
                    {objectivesIdList.slice(0, infiniteScroller.shownCount).map((objectiveId: number, index: number) => {
                        return (
                            <Paper
                                className={classes.submissionPanelWrapper}
                                key={objectiveId * objectiveId + index * 2}
                                elevation={0}
                                variant="outlined"
                            >
                                <Typography variant="h4">
                                    <b>{objectiveSubmissionMap.get(objectiveId)[0].objectiveTitle}</b> feladat beadásai
                                </Typography>
                                <Typography variant="subtitle1" className={classes.subtitle}>
                                    Beadások:{' '}
                                </Typography>
                                {objectiveSubmissionMap
                                    .get(objectiveId)
                                    .map((submission) => {
                                        return (
                                            <>
                                                <SubmissionDisplayContainer
                                                    key={submission.id}
                                                    overriddenBeginningEntity={submission}
                                                    shouldCreateNew={false}
                                                    displayExtraProps={{
                                                        showObjectiveTitle: !isValidNumber(props.filteredObjectiveId),
                                                        showTeamName: !isValidNumber(props.filteredTeamId),
                                                    }}
                                                />
                                            </>
                                        );
                                    })}
                                
                            </Paper>
                        );
                    })}
                    {infiniteScroller.canShownCountBeIncreased && (
                                    <Grid container justify="center">
                                        <Button
                                            size="large"
                                            variant="text"
                                            fullWidth
                                            color="secondary"
                                            onClick={() => infiniteScroller.increaseShownCount(5)}
                                        >
                                            &darr; Show more &darr;
                                        </Button>
                                    </Grid>
                                )}
                </>
            )}
        </div>
    );
};

export default SubmissionsPanel;
