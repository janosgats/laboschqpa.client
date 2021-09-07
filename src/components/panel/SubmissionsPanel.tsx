import React, { FC, useState } from 'react'
import useEndpoint from "~/hooks/useEndpoint";
import { SubmissionDisplayContainer } from "~/components/fetchableDisplay/FetchableDisplayContainer";
import { Submission } from "~/model/usergeneratedcontent/Submission";
import { isValidNumber } from "~/utils/CommonValidators";
import useInfiniteScroller, { InfiniteScroller } from "~/hooks/useInfiniteScroller";
import { Box, Divider, Paper, Typography } from '@material-ui/core';

interface Props {
    filteredObjectiveId?: number;
    filteredTeamId?: number;
}

const SubmissionsPanel: FC<Props> = (props) => {
    const infiniteScroller: InfiniteScroller = useInfiniteScroller({
        startingShowCount: 5
    });

    const [objectiveSubmissionMap, setObjectiveSubmissionMap] = useState<Map<number, Submission[]>>(null);

    const [objectivesIdList, setObjectivesIdList] = useState<number[]>(null);

    const usedEndpoint = useEndpoint<Submission[]>({
        conf: {
            url: "/api/up/server/api/submission/display/list",
            method: "post",
            data: {
                objectiveId: props.filteredObjectiveId,
                teamId: props.filteredTeamId,
            }
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
                }
                else {
                    tempHashMap.set(submission.objectiveId, [submission]);
                    tempObjectives.push(submission.objectiveId)
                }
            })
            setObjectiveSubmissionMap(tempHashMap);
            setObjectivesIdList(tempObjectives);
        }
    });

    return (
        <div>
            {usedEndpoint.pending && (
                <p>Pending...</p>
            )}
            {usedEndpoint.failed && (
                <p>Couldn't load submissions :'(</p>
            )}


            {usedEndpoint.succeeded && (
                <>
                    {
                        objectivesIdList.map((objectiveId: number, index: number) => {
                            return (
                                <Paper
                                    style={{ marginBottom: "8px", padding: "16px" }} key={objectiveId * objectiveId + index * 2}
                                    elevation={0}
                                    variant="outlined"
                                    >
                                    <Typography variant="h4">{objectiveSubmissionMap.get(objectiveId)[0].objectiveTitle}</Typography>
                                    <Typography variant="subtitle1">Beadások: </Typography>
                                    {
                                        objectiveSubmissionMap.get(objectiveId).map((submission) => {
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

                                            )
                                        })
                                    }
                                </Paper>
                            )
                        })

                    }
                </>
            )}
        </div>
    );
}

export default SubmissionsPanel;