import React, {FC} from "react";
import useEndpoint from "~/hooks/useEndpoint";
import {Program} from "~/model/usergeneratedcontent/Program";
import Spinner from "~/components/Spinner";

interface Props {
    teamId: number;
}

const ProgramScoresOfTeam: FC<Props> = (props) => {
    const usedEndpoint = useEndpoint<Program[]>({
        conf: {
            url: "/api/up/server/api/program/listAllWithTeamScore",
            method: "get",
            params: {
                teamId: props.teamId,
            },
        },
        deps: [props.teamId],
    });

    return (
        <div>
            <h3>Pontok:</h3>

            {usedEndpoint.pending && <Spinner/>}

            {usedEndpoint.failed && <p>Couldn't load program scores :'(</p>}

            {usedEndpoint.succeeded && (
                <ul>
                    {usedEndpoint.data
                        .map((program, index) => {
                            return (
                                <li>{program.title}: {program.teamScore}</li>
                            );
                        })}
                </ul>
            )}
        </div>
    );
};

export default ProgramScoresOfTeam;
