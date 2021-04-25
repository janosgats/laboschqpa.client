import React, {FC, useContext, useEffect, useState} from 'react'
import useEndpoint from "~/hooks/useEndpoint";
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import {Authority} from "~/enums/Authority";
import {ObjectiveType} from "~/enums/ObjectiveType";
import {Objective} from "~/model/usergeneratedcontent/Objective";
import {ObjectiveDisplayContainer} from "~/components/fetchableDisplay/FetchableDisplayContainer";

interface Props {
    filteredObjectiveTypes: ObjectiveType[];
}

const ObjectivesPanel: FC<Props> = (props) => {
    const currentUser = useContext(CurrentUserContext);

    const [wasCreateNewObjectiveClicked, setWasCreateNewPostClicked] = useState<boolean>(false);

    const usedEndpoint = useEndpoint<Objective[]>({
        conf: {
            url: "/api/up/server/api/objective/listWithAttachments",
            method: "post",
            data: {
                objectiveTypes: props.filteredObjectiveTypes
            }
        }, deps: props.filteredObjectiveTypes
    });

    useEffect(() => {
        setWasCreateNewPostClicked(false);
    }, [usedEndpoint.data]);

    return (
        <div>
            {(!wasCreateNewObjectiveClicked) && currentUser.hasAuthority(Authority.ObjectiveEditor) && (
                <button onClick={() => setWasCreateNewPostClicked(true)}>Create new objective</button>
            )}

            {wasCreateNewObjectiveClicked && (
                <ObjectiveDisplayContainer
                    shouldCreateNew={true}
                />
            )}

            {
                usedEndpoint.pending && (
                    <p>Pending...</p>
                )
            }
            {
                usedEndpoint.error && (
                    <p>Couldn't load objectives :'(</p>
                )
            }
            {
                usedEndpoint.data &&
                usedEndpoint.data.map((objective, index) => {
                    return (
                        <ObjectiveDisplayContainer
                            key={objective.id}
                            overriddenBeginningEntity={objective}
                            shouldCreateNew={false}
                        />
                    );
                })
            }
        </div>
    );
}

export default ObjectivesPanel;