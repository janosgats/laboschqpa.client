import {Button, createStyles, Grid, makeStyles, Paper, Theme, Typography} from '@material-ui/core';
import React, {FC, useEffect, useState} from 'react';
import {SubmissionDisplayContainer} from '~/components/fetchableDisplay/FetchableDisplayContainer';
import useEndpoint from '~/hooks/useEndpoint';
import useInfiniteScroller, {InfiniteScroller} from '~/hooks/useInfiniteScroller';
import {Submission} from '~/model/usergeneratedcontent/Submission';
import {isValidNumber} from '~/utils/CommonValidators';
import Spinner from '../Spinner';
import {styles} from './styles/SubmissionsPanelStyle';

const OUTER_SCROLLER_STARTING_SHOW_COUNT = 3;
const INNER_SCROLLER_STARTING_SHOW_COUNT = 3;

const useStyles = makeStyles((theme: Theme) => createStyles(styles));

interface SubmissionsInObjectiveProps{
    submissions: Submission[];
    filteredObjectiveId?: number;
    filteredTeamId?: number;
}

const SubmissionsInObjective: FC<SubmissionsInObjectiveProps> = (props)=>{
    const classes = useStyles();

    const infiniteScroller: InfiniteScroller = useInfiniteScroller({
        startingShowCount: INNER_SCROLLER_STARTING_SHOW_COUNT,
    });

    useEffect(() => {
        infiniteScroller.setMaxLength(props.submissions.length);
    }, [props.submissions]);

    return (
        <Paper
            className={classes.submissionPanelWrapper}
            elevation={0}
            variant="outlined"
        >
            <Typography variant="h4">
                <b>{props.submissions[0].objectiveTitle}</b> feladat beadásai
            </Typography>
            <Typography variant="subtitle1" className={classes.subtitle}>
                Beadások:{' '}
            </Typography>
            {props.submissions
                .slice(0, infiniteScroller.shownCount)
                .map((submission) => {
                    return (
                            <SubmissionDisplayContainer
                                key={submission.id}
                                overriddenBeginningEntity={submission}
                                shouldCreateNew={false}
                                displayExtraProps={{
                                    showObjectiveTitle: !isValidNumber(props.filteredObjectiveId),
                                    showTeamName: !isValidNumber(props.filteredTeamId),
                                }}
                            />
                    );
                })}

            {infiniteScroller.canShownCountBeIncreased && (
                <Grid container justify="center">
                    <Button
                        size="large"
                        variant="text"
                        fullWidth
                        color="secondary"
                        onClick={() => infiniteScroller.increaseShownCount(3)}
                    >
                        &darr; Show more submissions &darr;
                    </Button>
                </Grid>
            )}

        </Paper>
    );
}

interface Props {
    filteredObjectiveId?: number;
    filteredTeamId?: number;
}

const SubmissionsPanel: FC<Props> = (props) => {
    const infiniteScroller: InfiniteScroller = useInfiniteScroller({
        startingShowCount: OUTER_SCROLLER_STARTING_SHOW_COUNT,
    });

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
            infiniteScroller.setMaxLength(tempHashMap.size);
            infiniteScroller.setCurrentShownCount(OUTER_SCROLLER_STARTING_SHOW_COUNT);
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
                            <SubmissionsInObjective
                            key={objectiveId}
                            filteredObjectiveId={props.filteredObjectiveId}
                            filteredTeamId={props.filteredTeamId}
                            submissions={objectiveSubmissionMap.get(objectiveId)}
                        />
                        );
                    })}
                    {infiniteScroller.canShownCountBeIncreased && (
                                    <Grid container justify="center">
                                        <Button
                                            size="large"
                                            variant="text"
                                            fullWidth
                                            color="secondary"
                                            onClick={() => infiniteScroller.increaseShownCount(3)}
                                        >
                                            &darr; Show more Objectives &darr;
                                        </Button>
                                    </Grid>
                                )}
                </>
            )}
        </div>
    );
};

export default SubmissionsPanel;
