import { Button, createStyles, Fab, Grid, makeStyles, Theme } from "@material-ui/core";
import React, { FC, useContext, useState } from "react";
import { ObjectiveDisplayContainer } from "~/components/fetchableDisplay/FetchableDisplayContainer";
import { CurrentUserContext } from "~/context/CurrentUserProvider";
import { Authority } from "~/enums/Authority";
import useEndpoint from "~/hooks/useEndpoint";
import useInfiniteScroller, { InfiniteScroller } from "~/hooks/useInfiniteScroller";
import { Objective } from "~/model/usergeneratedcontent/Objective";
import Spinner from "../Spinner";
import styles from "./styles/ObjectivePanelStyle";
import AddIcon from "@material-ui/icons/Add";
import { ObjectiveType } from "~/enums/ObjectiveType";


const useStyles = makeStyles((theme: Theme) => createStyles(styles));

interface Props {
    programId: number;
    filteredObjectiveType: ObjectiveType;
}

const ObjectivesPanel: FC<Props> = (props) => {
    const classes = useStyles();

    const infiniteScroller: InfiniteScroller = useInfiniteScroller({
        startingShowCount: 5,
    });

    const usedEndpoint = useEndpoint<Objective[]>({
        conf: {
            url: "/api/up/server/api/objective/listObjectivesBelongingToProgram",
            method: "get",
            params: {
                programId: props.programId,
                objectiveType: props.filteredObjectiveType, 
            },
        },
        deps: [props.programId],
        onSuccess: (res) => {
            infiniteScroller.setMaxLength(res.data.length);
        },
    });

    const [wasCreateNewObjectiveClicked, setWasCreateNewObjectiveClicked] = useState<boolean>(false);
    const currentUser = useContext(CurrentUserContext);

    return (
        <div>
            {!wasCreateNewObjectiveClicked &&
                currentUser.hasAuthority(Authority.ObjectiveEditor) && (
                    <>
                        <Fab
                            size="large"
                            aria-label="add"
                            color="secondary"
                            style={{ position: "fixed" }}
                            className={classes.floatingActionButton}
                            onClick={() => setWasCreateNewObjectiveClicked(true)}
                        >
                            <AddIcon />
                        </Fab>
                    </>
                )}

            {wasCreateNewObjectiveClicked && (
                <ObjectiveDisplayContainer  shouldCreateNew={true}
                    onCancelledNewCreation={() => setWasCreateNewObjectiveClicked(false)} />
            )}

            {usedEndpoint.pending && <Spinner />}

            {usedEndpoint.failed && <p>Couldn't load objectives :'(</p>}

            {usedEndpoint.succeeded && (
                <>
                    {usedEndpoint.data
                        .slice(0, infiniteScroller.shownCount)
                        .map((objective, index) => {
                            return (
                                <ObjectiveDisplayContainer
                                    key={objective.id}
                                    overriddenBeginningEntity={objective}
                                    shouldCreateNew={false}
                                />
                            );
                        })}
                    {infiniteScroller.canShownCountBeIncreased && (
                        <Grid container justify="center">
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
                    )}
                </>
            )}
        </div>
    );
};

export default ObjectivesPanel;
