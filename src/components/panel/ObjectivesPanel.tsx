import React, { FC, useContext, useEffect, useState } from 'react'
import useEndpoint from "~/hooks/useEndpoint";
import { CurrentUserContext } from "~/context/CurrentUserProvider";
import { Authority } from "~/enums/Authority";
import { ObjectiveType } from "~/enums/ObjectiveType";
import { Objective } from "~/model/usergeneratedcontent/Objective";
import { ObjectiveDisplayContainer } from "~/components/fetchableDisplay/FetchableDisplayContainer";
import useInfiniteScroller, { InfiniteScroller } from "~/hooks/useInfiniteScroller";
import { Button, createStyles, Fab, Grid, makeStyles, Theme } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import styles from './styles/ObjectivePanelStyle';

const useStyles = makeStyles((theme: Theme) => createStyles(styles))

interface Props {
    filteredObjectiveTypes: ObjectiveType[];
}

const ObjectivesPanel: FC<Props> = (props) => {
    const classes = useStyles()
    const currentUser = useContext(CurrentUserContext);

    const infiniteScroller: InfiniteScroller = useInfiniteScroller({
        startingShowCount: 5
    });

    const [wasCreateNewObjectiveClicked, setWasCreateNewPostClicked] = useState<boolean>(false);

    const usedEndpoint = useEndpoint<Objective[]>({
        conf: {
            url: "/api/up/server/api/objective/listForDisplay",
            method: "post",
            data: {
                objectiveTypes: props.filteredObjectiveTypes
            }
        },
        deps: props.filteredObjectiveTypes,
        onSuccess: (res) => {
            infiniteScroller.setMaxLength(res.data.length);
        }
    });

    useEffect(() => {
        setWasCreateNewPostClicked(false);
    }, [usedEndpoint.data]);

    return (
        <div>
            {!wasCreateNewObjectiveClicked && currentUser.hasAuthority(Authority.ObjectiveEditor) && (
                <>
                    <Fab
                        size="large"
                        aria-label="add"
                        color="secondary"
                        style={{position: "fixed"}}
                        className={classes.floatingActionButton}
                        onClick={() => setWasCreateNewPostClicked(true)}
                    >
                        <AddIcon />
                    </Fab>
                </>
            )}

            {wasCreateNewObjectiveClicked && (
                <ObjectiveDisplayContainer
                    shouldCreateNew={true}
                />
            )}

            {usedEndpoint.pending && (
                <p>Pending...</p>
            )}

            {usedEndpoint.failed && (
                <p>Couldn't load objectives :'(</p>
            )}

            {usedEndpoint.succeeded && (
                <>
                    {usedEndpoint.data.slice(0, infiniteScroller.shownCount).map((objective, index) => {
                        return (
                            <ObjectiveDisplayContainer
                                key={objective.id}
                                overriddenBeginningEntity={objective}
                                shouldCreateNew={false}
                            />
                        );
                    })}
                    {infiniteScroller.canShownCountBeIncreased && (
                        <Grid
                            container
                            justify="center"
                        >
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
}

export default ObjectivesPanel;