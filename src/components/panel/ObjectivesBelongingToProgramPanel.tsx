import {
    Button,
    createStyles,
    Dialog,
    DialogContent,
    DialogTitle,
    Fab,
    Grid,
    makeStyles,
    Theme
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import React, {FC, useContext, useEffect, useState} from 'react';
import {ObjectiveDisplayContainer} from '~/components/fetchableDisplay/FetchableDisplayContainer';
import {CurrentUserContext} from '~/context/CurrentUserProvider';
import {Authority} from '~/enums/Authority';
import {ObjectiveType} from '~/enums/ObjectiveType';
import useEndpoint from '~/hooks/useEndpoint';
import useInfiniteScroller, {InfiniteScroller} from '~/hooks/useInfiniteScroller';
import {Objective} from '~/model/usergeneratedcontent/Objective';
import Spinner from '../Spinner';
import styles from './styles/ObjectivePanelStyle';
import MyPaper from "~/components/mui/MyPaper";

const useStyles = makeStyles((theme: Theme) => createStyles(styles));

interface Props {
    programId: number;
    filteredObjectiveType: ObjectiveType;
}

const ObjectivesBelongingToProgramPanel: FC<Props> = (props) => {
    const classes = useStyles();

    const infiniteScroller: InfiniteScroller = useInfiniteScroller({
        startingShowCount: 40,
    });

    const usedEndpoint = useEndpoint<Objective[]>({
        conf: {
            url: '/api/up/server/api/objective/listObjectivesBelongingToProgram',
            method: 'get',
            params: {
                programId: props.programId,
                objectiveType: props.filteredObjectiveType,
            },
        },
        deps: [props.programId, props.filteredObjectiveType],
        onSuccess: (res) => {
            infiniteScroller.setMaxLength(res.data.length);
        },
    });

    useEffect(() => {
        infiniteScroller.resetCurrentShownCount();
    }, [props.filteredObjectiveType, props.programId]);

    const [wasCreateNewObjectiveClicked, setWasCreateNewObjectiveClicked] = useState<boolean>(false);
    const currentUser = useContext(CurrentUserContext);

    return (
        <>
            {!wasCreateNewObjectiveClicked && currentUser.hasAuthority(Authority.ObjectiveEditor) && (
                <>
                    <Fab
                        size="large"
                        aria-label="add"
                        color="secondary"
                        style={{position: 'fixed'}}
                        className={classes.floatingActionButton}
                        onClick={() => setWasCreateNewObjectiveClicked(true)}
                    >
                        <AddIcon />
                    </Fab>
                </>
            )}

            {wasCreateNewObjectiveClicked && (
                <Dialog open={true} onClose={() => setWasCreateNewObjectiveClicked(false)}>
                    <DialogTitle>Feladat létrehozás</DialogTitle>
                    <DialogContent>
                        <ObjectiveDisplayContainer
                            shouldCreateNew={true}
                            onCreatedNew={() => {
                                setWasCreateNewObjectiveClicked(false);
                                usedEndpoint.reloadEndpoint();
                            }}
                            onCancelledNewCreation={() => setWasCreateNewObjectiveClicked(false)}
                        />
                    </DialogContent>
                </Dialog>
            )}

            {usedEndpoint.pending && <Spinner />}

            {usedEndpoint.failed && <p>Couldn't load objectives :'(</p>}

            {usedEndpoint.succeeded && (
                <Grid container direction="column" spacing={2}>
                    {usedEndpoint.data.slice(0, infiniteScroller.shownCount).map((objective, index) => {
                        return (
                            <Grid item key={objective.id}>
                                <ObjectiveDisplayContainer
                                    overriddenBeginningEntity={objective}
                                    shouldCreateNew={false}
                                />
                            </Grid>
                        );
                    })}
                    {infiniteScroller.canShownCountBeIncreased && (
                        <MyPaper p={0}>
                            <Grid item container justify="center">
                                <Button
                                    size="large"
                                    variant="text"
                                    fullWidth
                                    color="secondary"
                                    onClick={() => infiniteScroller.increaseShownCount(5)}
                                    className={classes.showMoreButton}
                                >
                                    &darr; Show more &darr;
                                </Button>
                            </Grid>
                        </MyPaper>
                    )}
                </Grid>
            )}
        </>
    );
};

export default ObjectivesBelongingToProgramPanel;
