import React, {FC, useEffect, useState} from "react";
import {
    Button,
    createStyles,
    Dialog,
    DialogContent,
    Grid,
    makeStyles,
    TextField,
    Theme,
    Typography,
} from "@material-ui/core";
import useEndpoint, {UsedEndpoint} from "~/hooks/useEndpoint";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import EventBus from "~/utils/EventBus";
import {AccessibleRiddle} from "~/model/usergeneratedcontent/AccessibleRiddle";
import Image from "~/components/image/Image";
import {dialogStyles} from "~/styles/dialog-styles";


interface RiddleSubmitSolutionResponse {
    isGivenSolutionCorrect: boolean;
    isCurrentlySolved: boolean;
    wasAlreadySolved: boolean;
}

const useStyles = makeStyles((theme: Theme) => {
    return createStyles(dialogStyles);
});

interface Props {
    onClose: (shouldReloadRiddleList: boolean) => void;
    isOpen: boolean;

    id: number;
}

const RiddleSolverDialog: FC<Props> = (props) => {
    const [shouldReloadRiddleList, setShouldReloadRiddleList] =
        useState<boolean>(false);

    const classes = useStyles();

    const [solutionToSubmit, setSolutionToSubmit] = useState<string>("");
    const [isHintShown, setIsHintShown] = useState<boolean>(false);
    const [isSolutionShown, setIsSolutionShown] = useState<boolean>(false);

    const usedEndpoint: UsedEndpoint<AccessibleRiddle> =
        useEndpoint<AccessibleRiddle>({
            conf: {
                url: "/api/up/server/api/riddle/riddle",
                params: {
                    id: props.id,
                },
            },
            deps: [props.id],
            enableRequest: props.isOpen,
        });

    useEffect(() => {
        setIsHintShown(false);
        setIsSolutionShown(false);
        setSolutionToSubmit("");
        if (props.isOpen) {
            setShouldReloadRiddleList(false);
        }
    }, [props.isOpen]);

    function askForHint() {
        callJsonEndpoint({
            conf: {
                url: "/api/up/server/api/riddle/useHint",
                method: "POST",
                params: {
                    id: props.id,
                },
            },
        })
            .then(() => {
                usedEndpoint.reloadEndpoint();
                setIsHintShown(true);
            })
            .catch(() => {
                EventBus.notifyError("Error while asking for hint");
            });
    }

    function submitSolution() {
        callJsonEndpoint<RiddleSubmitSolutionResponse>({
            conf: {
                url: "/api/up/server/api/riddle/submitSolution",
                method: "POST",
                params: {
                    id: props.id,
                    solution: solutionToSubmit,
                },
            },
        })
            .then((res) => {
                if (res.data.isGivenSolutionCorrect) {
                    if (!res.data.wasAlreadySolved) {
                        setShouldReloadRiddleList(true);
                    }
                    usedEndpoint.reloadEndpoint();
                    alert("Yaay! It's correct!");
                } else {
                    alert("Nah! Try again!");
                }
            })
            .catch(() => {
                EventBus.notifyError("Error while submitting solution");
            });
    }

    const riddle: AccessibleRiddle = usedEndpoint.data;

    return (
        <Dialog
            open={props.isOpen}
            onClose={() => props.onClose(shouldReloadRiddleList)}
        >
            <DialogContent>
                {usedEndpoint.pending && <p>Fetching riddle...</p>}
                {usedEndpoint.failed && (
                    <>
                        <p>Error while fetching riddle :'(</p>
                        <Button onClick={() => usedEndpoint.reloadEndpoint()}>Retry</Button>
                    </>
                )}

                {usedEndpoint.succeeded && (
                    <>
                        <Grid
                            container
                            justify="center"
                            direction="column"
                            spacing={2}
                            style={{minWidth: 450}}
                        >
                            <Grid
                                item
                                container
                                justify="center"
                            >
                                <Typography variant="h2">{riddle.title}</Typography>
                            </Grid>
                            {riddle.attachments?.[0] && (

                                <Grid
                                    item
                                    container
                                    justify="center"
                                >
                                    <Image fileId={riddle.attachments[0]} maxSize={300}/>
                                </Grid>
                            )}

                            <Grid
                                item
                                justify="center"
                            >
                                {riddle.wasHintUsed ? (
                                    <>
                                        {isHintShown ? (
                                            <Typography>Hint: {riddle.hint}</Typography>
                                        ) : (
                                            <Button
                                                size="medium"
                                                variant="text"
                                                onClick={() => setIsHintShown(true)}
                                                color="default"
                                                fullWidth
                                            >
                                                Mutasd a hint
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <Button
                                        size="medium"
                                        variant="outlined"
                                        onClick={() => askForHint()}
                                        fullWidth
                                    >
                                        K??rek hintet
                                    </Button>
                                )}
                            </Grid>

                            <Grid
                                item
                                container
                                direction="column"
                            >
                                <TextField
                                    className={classes.inputs}
                                    variant="outlined"
                                    color="secondary"
                                    type="text"
                                    value={solutionToSubmit}
                                    onChange={(e) => setSolutionToSubmit(e.target.value)}
                                    label="Tipped"
                                    fullWidth

                                />
                                <Button
                                    className={classes.inputs}
                                    color="primary"
                                    size="large"
                                    variant="contained"
                                    onClick={() => submitSolution()}
                                    fullWidth

                                >
                                    Bek??ld??s
                                </Button>

                                {riddle.isAlreadySolved && (
                                    <>
                                        {isSolutionShown ? (
                                            <p>Correct solution: {riddle.solution}</p>
                                        ) : (
                                            <Button
                                                className={classes.inputs}
                                                size="large"
                                                variant="contained"
                                                color="secondary"
                                                onClick={() => setIsSolutionShown(true)}
                                                fullWidth

                                            >
                                                Mutasd a megold??st
                                            </Button>
                                        )}
                                    </>
                                )}
                            </Grid>
                        </Grid>
                    </>

                )}
            </DialogContent>
        </Dialog>
    );
};

export default RiddleSolverDialog;
