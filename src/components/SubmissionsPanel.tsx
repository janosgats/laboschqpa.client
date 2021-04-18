import React, {FC} from 'react'
import useEndpoint from "~/hooks/useEndpoint";
import {SubmissionDisplayContainer} from "~/components/fetchableDisplay/FetchableDisplayContainer";
import {Submission} from "~/model/usergeneratedcontent/Submission";
import {isValidNumber} from "~/utils/CommonValidators";

interface Props {
    filteredObjectiveId?: number;
    filteredTeamId?: number;
}

const SubmissionsPanel: FC<Props> = (props) => {
    const usedEndpoint = useEndpoint<Submission[]>({
        config: {
            url: "/api/up/server/api/submission/display/list",
            method: "post",
            data: {
                objectiveId: props.filteredObjectiveId,
                teamId: props.filteredTeamId,
            }
        }, deps: [props.filteredObjectiveId, props.filteredTeamId]
    });

    return (
        <div>
            {
                usedEndpoint.pending && (
                    <p>Pending...</p>
                )
            }
            {
                usedEndpoint.error && (
                    <p>Couldn't load submissions :'(</p>
                )
            }
            {
                usedEndpoint.data &&
                usedEndpoint.data.map((submission, index) => {
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
                })
            }
        </div>
    );
}

export default SubmissionsPanel;