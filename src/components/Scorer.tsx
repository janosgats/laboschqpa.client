import {AxiosRequestConfig} from 'axios';
import React, {FC, useEffect, useState} from 'react';
import {objectiveTypeData} from '~/enums/ObjectiveType';
import useEndpoint from '~/hooks/useEndpoint';
import {TeamInfo} from '~/model/Team';
import {TeamScore} from '~/model/TeamScore';
import {Objective} from '~/model/usergeneratedcontent/Objective';
import callJsonEndpoint from '~/utils/api/callJsonEndpoint';
import {isValidNumber} from '~/utils/CommonValidators';
import EventBus from '~/utils/EventBus';
import Spinner from './Spinner';
import {ObjectiveAcceptance} from "~/model/ObjectiveAcceptance";

interface Props {
    defaultObjectiveId?: number;
    defaultTeamId?: number;
    onClose: () => void;
}

const Scorer: FC<Props> = (props) => {
    const [selectedObjectiveId, setSelectedObjectiveId] = useState<number>(props.defaultObjectiveId);
    const [selectedTeamId, setSelectedTeamId] = useState<number>(props.defaultTeamId);
    const [givenScore, setGivenScore] = useState<number>(0);
    const [saveOrDeletionInProgress, setSaveOrDeletionInProgress] = useState<boolean>(false);

    const usedEndpointObjectives = useEndpoint<Objective[]>({
        conf: {
            url: '/api/up/server/api/objective/listAll',
        },
    });
    const fetchedObjectives = usedEndpointObjectives.data;

    const usedEndpointTeams = useEndpoint<TeamInfo[]>({
        conf: {
            url: '/api/up/server/api/team/listAll',
        },
    });
    const fetchedTeams = usedEndpointTeams.data;

    const usedEndpointTeamScore = useEndpoint<TeamScore[]>({
        conf: {
            url: '/api/up/server/api/teamScore/find',
            params: {
                objectiveId: selectedObjectiveId,
                teamId: selectedTeamId,
            },
        },
        deps: [selectedObjectiveId, selectedTeamId],
        enableRequest: isValidNumber(selectedTeamId) && isValidNumber(selectedObjectiveId),
    });

    const usedEndpointAcceptance = useEndpoint<ObjectiveAcceptance>({
        conf: {
            url: '/api/up/server/api/objectiveAcceptance/isAccepted',
            params: {
                objectiveId: selectedObjectiveId,
                teamId: selectedTeamId,
            },
        },
        deps: [selectedObjectiveId, selectedTeamId],
        enableRequest: isValidNumber(selectedTeamId) && isValidNumber(selectedObjectiveId),
    });

    const isTeamScoreAlreadyExisting = usedEndpointTeamScore.data && usedEndpointTeamScore.data.length > 0;

    useEffect(() => {
        if (isTeamScoreAlreadyExisting) {
            setGivenScore(usedEndpointTeamScore.data[0].score);
        } else {
            setGivenScore(0);
        }
    }, [usedEndpointTeamScore.data]);

    function doSave() {
        setSaveOrDeletionInProgress(true);

        const requestConfig: AxiosRequestConfig = {
            method: 'post',
        };
        if (isTeamScoreAlreadyExisting) {
            requestConfig.url = '/api/up/server/api/teamScore/edit';
            requestConfig.data = {
                id: usedEndpointTeamScore.data[0].id,
                score: givenScore,
            };
        } else {
            requestConfig.url = '/api/up/server/api/teamScore/createNew';
            requestConfig.data = {
                objectiveId: selectedObjectiveId,
                teamId: selectedTeamId,
                score: givenScore,
            };
        }

        callJsonEndpoint({
            conf: requestConfig,
        })
            .then(() => props.onClose())
            .catch(() => EventBus.notifyError('Error while saving', 'Cannot save TeamScore'))
            .finally(() => setSaveOrDeletionInProgress(false));
    }

    function doDelete() {
        setSaveOrDeletionInProgress(true);

        callJsonEndpoint({
            conf: {
                url: '/api/up/server/api/teamScore/delete',
                method: 'delete',
                params: {
                    id: usedEndpointTeamScore.data[0].id,
                },
            },
        })
            .then(() => props.onClose())
            .catch(() => EventBus.notifyError('Error while deleting', 'Cannot delete TeamScore'))
            .finally(() => setSaveOrDeletionInProgress(false));
    }

    async function doSetAcceptance(wantedIsAccepted: boolean) {
        await callJsonEndpoint({
            conf: {
                url: '/api/up/server/api/objectiveAcceptance/setAcceptance',
                method: 'post',
                data: {
                    objectiveId: selectedObjectiveId,
                    teamId: selectedTeamId,
                    wantedIsAccepted: wantedIsAccepted,
                }
            }
        }).then(() => {
            usedEndpointAcceptance.reloadEndpoint();
        });
    }

    return (
        <div style={{borderStyle: 'solid'}}>
            <p>TODO: This should be a modal</p>
            <button onClick={() => props.onClose()}>Close modal</button>

            {(usedEndpointObjectives.pending || usedEndpointTeams.pending) && <Spinner/>}

            {(usedEndpointObjectives.failed || usedEndpointTeams.failed) && (
                <>
                    <p>Couldn't load teams and objectives :'(</p>
                    <button
                        onClick={() => {
                            usedEndpointObjectives.reloadEndpoint();
                            usedEndpointTeams.reloadEndpoint();
                        }}
                    >
                        Retry
                    </button>
                </>
            )}

            {fetchedObjectives && fetchedTeams && (
                <>
                    <br/>
                    <label>Objective: </label>
                    <select
                        value={selectedObjectiveId}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (isValidNumber(val)) {
                                setSelectedObjectiveId(Number.parseInt(val));
                            }
                        }}
                    >
                        <option>Select an objective...</option>
                        {fetchedObjectives.map((objective) => {
                            return (
                                <option key={objective.id} value={objective.id}>
                                    {`${objectiveTypeData[objective.objectiveType].shortDisplayName} > ${objective.title}`}
                                </option>
                            );
                        })}
                    </select>
                    <br/>
                    <label>Team: </label>
                    <select
                        value={selectedTeamId}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (isValidNumber(val)) {
                                setSelectedTeamId(Number.parseInt(val));
                            }
                        }}
                    >
                        <option>Select a team...</option>
                        {fetchedTeams.map((team) => {
                            return (
                                <option key={team.id} value={team.id}>
                                    {team.name + (team.archived ? ' (archive)' : '')}
                                </option>
                            );
                        })}
                    </select>
                    <br/>

                    {usedEndpointTeamScore.pending && <Spinner/>}

                    {usedEndpointTeamScore.failed && (
                        <>
                            <p>Couldn't load score of this team for this objective :'(</p>
                            <button onClick={() => usedEndpointTeamScore.reloadEndpoint()}>Retry</button>
                        </>
                    )}

                    {usedEndpointTeamScore.data && (
                        <>
                            <input type="number" value={givenScore}
                                   onChange={(e) => setGivenScore(Number.parseInt(e.target.value))}/>
                            {isTeamScoreAlreadyExisting ? (
                                <>
                                    <button onClick={doSave} disabled={saveOrDeletionInProgress}>
                                        Modify
                                    </button>
                                    <button onClick={doDelete} disabled={saveOrDeletionInProgress}>
                                        Delete
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={doSave} disabled={saveOrDeletionInProgress}>
                                        Create
                                    </button>
                                </>
                            )}
                        </>
                    )}

                    {usedEndpointAcceptance.pending && <Spinner/>}

                    {usedEndpointAcceptance.failed && (
                        <>
                            <p>Couldn't load acceptance of this team for this objective :'(</p>
                            <button onClick={() => usedEndpointAcceptance.reloadEndpoint()}>Retry</button>
                        </>
                    )}

                    {usedEndpointAcceptance.data && (
                        <>
                            {usedEndpointAcceptance.data.isAccepted ? (
                                <button onClick={() => doSetAcceptance(false)}>
                                    Megjelölés NEM elfogadottként
                                </button>
                            ) : (
                                <button onClick={() => doSetAcceptance(true)}>
                                    Megjelölés elfogadottként
                                </button>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default Scorer;
