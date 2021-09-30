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
import {Autocomplete} from "@material-ui/lab";
import {TextField} from "@material-ui/core";
import {filterByNormalizedWorldSplit} from "~/utils/filterByNormalizedWorldSplit";

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
                    <Autocomplete
                        style={{width: '350px', padding: '10px 0'}}
                        options={fetchedObjectives}
                        getOptionLabel={(objective: Objective) => `${objectiveTypeData[objective.objectiveType]?.displayName} > ${objective.title}`}
                        renderInput={(params) => <TextField {...params} label="Feladat" variant="outlined" />}
                        value={fetchedObjectives.filter((o) => o.id === selectedObjectiveId)[0]}
                        onChange={(e, val: Objective) => {
                            if (val && isValidNumber(val.id)) {
                                setSelectedObjectiveId(Number.parseInt(val.id as any));
                            }
                        }}
                        filterOptions={filterByNormalizedWorldSplit}
                    />
                    <br/>
                    <Autocomplete
                        style={{width: '350px', padding: '10px 0'}}
                        options={fetchedTeams}
                        getOptionLabel={(team: TeamInfo) => team.name + (team.archived ? ' (archive)' : '')}
                        renderInput={(params) => <TextField {...params} label="Csapat" variant="outlined" />}
                        value={fetchedTeams.filter((t) => t.id === selectedTeamId)[0]}
                        onChange={(e, val: TeamInfo) => {
                            if (val && isValidNumber(val.id)) {
                                setSelectedTeamId(Number.parseInt(val.id as any));
                            }
                        }}
                        filterOptions={filterByNormalizedWorldSplit}
                    />
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
