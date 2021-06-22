import React, {FC} from 'react'
import useEndpoint from "~/hooks/useEndpoint";
import {SubmissionDisplayContainer} from "~/components/fetchableDisplay/FetchableDisplayContainer";
import {Submission} from "~/model/usergeneratedcontent/Submission";
import {isValidNumber} from "~/utils/CommonValidators";
import useInfiniteScroller, {InfiniteScroller} from "~/hooks/useInfiniteScroller";

interface Props {
    filteredObjectiveId?: number;
    filteredTeamId?: number;
}

const SubmissionsPanel: FC<Props> = (props) => {
    const infiniteScroller: InfiniteScroller = useInfiniteScroller({
        startingShowCount: 5
    });

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
                    {usedEndpoint.data.slice(0, infiniteScroller.shownCount).map((submission, index) => {
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
                        <button onClick={() => infiniteScroller.increaseShownCount(5)}>
                            &darr;&darr; Show more &darr;&darr;
                        </button>
                    )}
                </>
            )}
        </div>
    );
}

export default SubmissionsPanel;