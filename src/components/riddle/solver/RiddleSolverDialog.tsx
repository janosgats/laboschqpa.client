import React, {FC, useEffect, useState} from "react";
import {Button, Dialog, DialogActions, DialogContent} from "@material-ui/core";
import useEndpoint, {UsedEndpoint} from "~/hooks/useEndpoint";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import EventBus from "~/utils/EventBus";
import {AccessibleRiddle} from "~/model/usergeneratedcontent/AccessibleRiddle";
import Image from "~/components/image/Image";

interface RiddleSubmitSolutionResponse {
    isGivenSolutionCorrect: boolean;
    isCurrentlySolved: boolean;
    wasAlreadySolved: boolean;
}

interface Props {
    onClose: (shouldReloadRiddleList: boolean) => void;
    isOpen: boolean;

    id: number;
}

const RiddleSolverDialog: FC<Props> = (props) => {
    const [shouldReloadRiddleList, setShouldReloadRiddleList] = useState<boolean>(false);

    const [solutionToSubmit, setSolutionToSubmit] = useState<string>('');
    const [isHintShown, setIsHintShown] = useState<boolean>(false);
    const [isSolutionShown, setIsSolutionShown] = useState<boolean>(false);

    const usedEndpoint: UsedEndpoint<AccessibleRiddle> = useEndpoint<AccessibleRiddle>({
        conf: {
            url: '/api/up/server/api/riddle/riddle',
            params: {
                id: props.id
            }
        },
        deps: [props.id],
        enableRequest: props.isOpen,
    });

    useEffect(() => {
        setIsHintShown(false);
        setIsSolutionShown(false);
        setSolutionToSubmit('');
        if (props.isOpen) {
            setShouldReloadRiddleList(false);
        }
    }, [props.isOpen])

    function askForHint() {
        callJsonEndpoint({
            conf: {
                url: '/api/up/server/api/riddle/useHint',
                method: 'POST',
                params: {
                    id: props.id,
                }
            }
        }).then(() => {
            usedEndpoint.reloadEndpoint();
            setIsHintShown(true);
        }).catch(() => {
            EventBus.notifyError('Error while asking for hint');
        })
    }

    function submitSolution() {
        callJsonEndpoint<RiddleSubmitSolutionResponse>({
            conf: {
                url: '/api/up/server/api/riddle/submitSolution',
                method: 'POST',
                params: {
                    id: props.id,
                    solution: solutionToSubmit,
                }
            }
        }).then((res) => {
            if (res.data.isGivenSolutionCorrect) {
                if (!res.data.wasAlreadySolved) {
                    setShouldReloadRiddleList(true);
                }
                usedEndpoint.reloadEndpoint();
                alert("Yaay! It's correct!");
            } else {
                alert("Nah! Try again!");
            }
        }).catch(() => {
            EventBus.notifyError('Error while submitting solution');
        })
    }

    const riddle: AccessibleRiddle = usedEndpoint.data;

    return (
        <Dialog open={props.isOpen} onClose={() => props.onClose(shouldReloadRiddleList)}>
            <DialogContent>
                {usedEndpoint.pending && (
                    <p>Fetching riddle...</p>
                )}
                {usedEndpoint.failed && (
                    <>
                        <p>Error while fetching riddle :'(</p>
                        <button onClick={() => usedEndpoint.reloadEndpoint()}>Retry</button>
                    </>
                )}

                {usedEndpoint.succeeded && (
                    <>
                        <h2>{riddle.title}</h2>
                        <br/>
                        {riddle.attachments?.[0] && (
                            <Image fileId={riddle.attachments[0]} maxSize={300}/>
                        )}
                        <br/>
                        {riddle.wasHintUsed
                            ? (
                                <>
                                    {isHintShown
                                        ? (
                                            <p>Hint: {riddle.hint}</p>
                                        ) : (
                                            <button onClick={() => setIsHintShown(true)}>Show hint</button>
                                        )}
                                </>
                            ) : (
                                <button onClick={() => askForHint()}>Ask for hint</button>
                            )}
                        <br/>

                        <label>Your solution: </label>
                        <input type="text" value={solutionToSubmit}
                               onChange={e => setSolutionToSubmit(e.target.value)}/>
                        <button onClick={() => submitSolution()}>Submit solution</button>

                        {riddle.isAlreadySolved && (
                            <>
                                <br/>
                                {isSolutionShown
                                    ? (
                                        <p>Correct solution: {riddle.solution}</p>
                                    ) : (
                                        <button onClick={() => setIsSolutionShown(true)}>Show correct solution</button>
                                    )}
                            </>
                        )}
                    </>
                )}

            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.onClose(shouldReloadRiddleList)} color="secondary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RiddleSolverDialog;