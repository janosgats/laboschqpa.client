import React, {FC, useContext, useEffect, useState} from 'react'
import useEndpoint from "~/hooks/useEndpoint";
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import {Authority} from "~/enums/Authority";
import {ObjectiveType} from "~/enums/ObjectiveType";
import {Objective} from "~/model/usergeneratedcontent/Objective";
import {ObjectiveDisplayContainer} from "~/components/fetchableDisplay/FetchableDisplayContainer";
import useInfiniteScroller, {InfiniteScroller} from "~/hooks/useInfiniteScroller";
import { Button } from '@material-ui/core';

interface Props {
    filteredObjectiveTypes: ObjectiveType[];
}

const ObjectivesPanel: FC<Props> = (props) => {
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
            {(!wasCreateNewObjectiveClicked) && currentUser.hasAuthority(Authority.ObjectiveEditor) && (
                <Button size="small" variant="contained" onClick={() => setWasCreateNewPostClicked(true)}>Create new objective</Button>
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
                        <Button size="small" variant="contained" onClick={() => infiniteScroller.increaseShownCount(5)}>
                            &darr;&darr; Show more &darr;&darr;
                        </Button>
                    )}
                </>
            )}
        </div>
    );
}

export default ObjectivesPanel;