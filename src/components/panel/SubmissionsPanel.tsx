import {Button, createStyles, Grid, makeStyles, Theme, Typography} from '@material-ui/core';
import React, {FC, useEffect, useState} from 'react';
import {SubmissionDisplayContainer} from '~/components/fetchableDisplay/FetchableDisplayContainer';
import useEndpoint from '~/hooks/useEndpoint';
import useInfiniteScroller, {InfiniteScroller} from '~/hooks/useInfiniteScroller';
import {Submission} from '~/model/usergeneratedcontent/Submission';
import {isValidNumber} from '~/utils/CommonValidators';
import MyPaper from '../mui/MyPaper';
import Spinner from '../Spinner';
import {styles} from './styles/SubmissionsPanelStyle';

const OUTER_SCROLLER_STARTING_SHOW_COUNT = 3;
const INNER_SCROLLER_STARTING_SHOW_COUNT = 3;

const useStyles = makeStyles((theme: Theme) => createStyles(styles));

interface SubmissionsInObjectiveProps {
    submissions: Submission[];
    filteredObjectiveId?: number;
    filteredTeamId?: number;
}

const SubmissionsInObjective: FC<SubmissionsInObjectiveProps> = (props) => {
    const classes = useStyles();

    const infiniteScroller: InfiniteScroller = useInfiniteScroller({
        startingShowCount: INNER_SCROLLER_STARTING_SHOW_COUNT,
    });

    useEffect(() => {
        infiniteScroller.setMaxLength(props.submissions.length);
    }, [props.submissions]);

    return (
        <MyPaper>
            <Typography variant="h4">
                <b>{props.submissions[0].objectiveTitle}</b> feladat beadásai
            </Typography>
            <Typography variant="subtitle1" className={classes.subtitle}>
                Beadások:
            </Typography>
            <Grid style={{marginTop: '.5rem'}} container direction="column" spacing={3}>
                {props.submissions.slice(0, infiniteScroller.shownCount).map((submission) => {
                    return (
                        <Grid item>
                            <SubmissionDisplayContainer
                                key={submission.id}
                                overriddenBeginningEntity={submission}
                                shouldCreateNew={false}
                                displayExtraProps={{
                                    showObjectiveTitle: !isValidNumber(props.filteredObjectiveId),
                                    showTeamName: !isValidNumber(props.filteredTeamId),
                                }}
                            />
                        </Grid>
                    );
                })}

                {infiniteScroller.canShownCountBeIncreased && (
                    <Grid item container justify="center">
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
            </Grid>
        </MyPaper>
    );
};

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
            infiniteScroller.resetCurrentShownCount();
            setObjectiveSubmissionMap(tempHashMap);
            setObjectivesIdList(tempObjectives);
        },
    });

    return (
        <>
            {usedEndpoint.pending && <Spinner />}
            {usedEndpoint.failed && <p>Couldn't load submissions :'(</p>}

            {usedEndpoint.succeeded && (
                <Grid container direction="column" spacing={2}>
                    {objectivesIdList.slice(0, infiniteScroller.shownCount).map((objectiveId: number, index: number) => {
                        return (
                            <Grid item>
                                <SubmissionsInObjective
                                    key={objectiveId}
                                    filteredObjectiveId={props.filteredObjectiveId}
                                    filteredTeamId={props.filteredTeamId}
                                    submissions={objectiveSubmissionMap.get(objectiveId)}
                                />
                            </Grid>
                        );
                    })}
                    {infiniteScroller.canShownCountBeIncreased && (
                        <Grid item>
                            <MyPaper p={0}>
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
                            </MyPaper>
                        </Grid>
                    )}
                </Grid>
            )}
        </>
    );
};

export default SubmissionsPanel;
