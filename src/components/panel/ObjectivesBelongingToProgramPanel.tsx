import {Button, createStyles, Grid, makeStyles, Theme} from "@material-ui/core";
import React, {FC} from "react";
import {ObjectiveDisplayContainer} from "~/components/fetchableDisplay/FetchableDisplayContainer";
import useEndpoint from "~/hooks/useEndpoint";
import useInfiniteScroller, {InfiniteScroller} from "~/hooks/useInfiniteScroller";
import {Objective} from "~/model/usergeneratedcontent/Objective";
import Spinner from "../Spinner";
import styles from "./styles/ObjectivePanelStyle";

const useStyles = makeStyles((theme: Theme) => createStyles(styles));

interface Props {
    programId: number;
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
            },
        },
        deps: [props.programId],
        onSuccess: (res) => {
            infiniteScroller.setMaxLength(res.data.length);
        },
    });

    return (
        <div>
            {usedEndpoint.pending && <Spinner/>}

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
