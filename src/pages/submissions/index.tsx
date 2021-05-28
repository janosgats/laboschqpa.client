import Head from 'next/head'
import {NextPage} from "next";
import React, {useState} from "react";
import {objectiveTypeData} from "~/enums/ObjectiveType";
import SubmissionsPanel from "~/components/panel/SubmissionsPanel";
import {isValidNumber} from "~/utils/CommonValidators";
import useEndpoint from "~/hooks/useEndpoint";
import {Objective} from "~/model/usergeneratedcontent/Objective";
import {TeamInfo} from "~/model/Team";
import NotAcceptedByEmailBanner from "~/components/banner/NotAcceptedByEmailBanner";

const NOT_FILTERED = 'not_filtered';

const Index: NextPage = () => {
    const [filteredObjectiveId, setFilteredObjectiveId] = useState<number>(null);
    const [filteredTeamId, setFilteredTeamId] = useState<number>(null);

    const usedEndpointObjectives = useEndpoint<Objective[]>({
        conf: {
            url: "/api/up/server/api/objective/listAll",
        }
    });
    const fetchedObjectives = usedEndpointObjectives.data;

    const usedEndpointTeams = useEndpoint<TeamInfo[]>({
        conf: {
            url: "/api/up/server/api/team/listAll",
        }
    });
    const fetchedTeams = usedEndpointTeams.data;

    return (
        <div>
            <Head>
                <title>Submissions</title>
            </Head>

            <NotAcceptedByEmailBanner/>

            {(usedEndpointObjectives.pending || usedEndpointTeams.pending) && (
                <p>Pending...</p>
            )}

            {(usedEndpointObjectives.error || usedEndpointTeams.error) && (
                <>
                    <p>Couldn't load teams and objectives :'(</p>
                    <button onClick={() => {
                        usedEndpointObjectives.reloadEndpoint();
                        usedEndpointTeams.reloadEndpoint();
                    }}>
                        Retry
                    </button>
                </>
            )}

            {fetchedObjectives && fetchedTeams && (
                <>
                    <label>Filter objective: </label>
                    <select value={filteredObjectiveId !== null ? filteredObjectiveId : ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (isValidNumber(val)) {
                                    setFilteredObjectiveId(Number.parseInt(e.target.value));
                                }
                                if (val === NOT_FILTERED) {
                                    setFilteredObjectiveId(null);
                                }
                            }}>
                        <option value={NOT_FILTERED}>Not filtered</option>
                        {fetchedObjectives.map(objective => {
                            return (
                                <option key={objective.id} value={objective.id}>
                                    {`${objectiveTypeData[objective.objectiveType].shortDisplayName} > ${objective.title}`}
                                </option>
                            );
                        })}
                    </select>
                    <br/>
                    <label>Filter team: </label>
                    <select value={filteredTeamId !== null ? filteredTeamId : ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (isValidNumber(val)) {
                                    setFilteredTeamId(Number.parseInt(e.target.value));
                                }
                                if (val === NOT_FILTERED) {
                                    setFilteredTeamId(null);
                                }
                            }}>

                        <option value={NOT_FILTERED}>Not filtered</option>
                        {fetchedTeams.map(team => {
                            return (
                                <option key={team.id} value={team.id}>
                                    {team.name + (team.archived ? ' (archive)' : '')}
                                </option>
                            );
                        })}
                    </select>
                    <br/>
                </>
            )}

            <SubmissionsPanel filteredObjectiveId={filteredObjectiveId} filteredTeamId={filteredTeamId}/>

        </div>
    )
};

export default Index;
