import React, {FC, useContext, useState} from 'react'
import useEndpoint from "~/hooks/useEndpoint";
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import {Authority} from "~/enums/Authority";
import {SpeedDrinkingDisplayContainer} from "~/components/fetchableDisplay/FetchableDisplayContainer";
import {SpeedDrinkingCategory} from "~/enums/SpeedDrinkingCategory";
import {SpeedDrinking} from "~/model/usergeneratedcontent/SpeedDrinking";

interface Props {
    filteredCategory: SpeedDrinkingCategory;
    filteredTeamId?: number;
}

const SpeedDrinkingPanel: FC<Props> = (props) => {
    const currentUser = useContext(CurrentUserContext);

    const [isCreatingNewDisplayShown, setIsCreatingNewDisplayShown] = useState<boolean>(false);

    const usedEndpoint = useEndpoint<SpeedDrinking[]>({
        conf: {
            url: "/api/up/server/api/speedDrinking/display/list",
            method: "post",
            data: {
                category: props.filteredCategory,
                teamId: props.filteredTeamId,
            }
        }, deps: [props.filteredCategory, props.filteredTeamId]
    });

    const [newlyCreatedSpeedDrinkingIds, setNewlyCreatedSpeedDrinkingIds] = useState<number[]>([]);

    return (
        <div>
            {currentUser.hasAuthority(Authority.SpeedDrinkingEditor) && (
                <div style={{borderStyle: 'solid', borderColor: 'orange'}}>
                    <h4>Times newly recorded by you</h4>

                    {(isCreatingNewDisplayShown || newlyCreatedSpeedDrinkingIds.length > 0) && (
                        <table>
                            <tr>
                                <th>#</th>
                                <th>category</th>
                                <th>name</th>
                                <th>team</th>
                                <th>time</th>
                                <th>note</th>
                                <th>when</th>
                                <th>edit</th>
                            </tr>
                            {
                                newlyCreatedSpeedDrinkingIds.map((id, index) => {
                                    return (
                                        <SpeedDrinkingDisplayContainer
                                            key={id}
                                            shouldCreateNew={false}
                                            entityId={id}
                                            displayExtraProps={{
                                                rowNumber: index + 1,
                                                showCategory: true,
                                                showName: true,
                                                showTeam: true,
                                            }}
                                        />
                                    );
                                })
                            }
                            {isCreatingNewDisplayShown && (
                                <tr>
                                    <SpeedDrinkingDisplayContainer
                                        shouldCreateNew={true}
                                        displayExtraProps={{
                                            showCategory: true,
                                            showName: true,
                                            showTeam: true,
                                        }}
                                        onCreatedNew={id => {
                                            setNewlyCreatedSpeedDrinkingIds([...newlyCreatedSpeedDrinkingIds, id]);
                                            setIsCreatingNewDisplayShown(false);
                                        }}
                                        onCancelledNewCreation={() => setIsCreatingNewDisplayShown(false)}
                                    />
                                </tr>
                            )}
                        </table>
                    )}
                    {(!isCreatingNewDisplayShown) && (
                        <button onClick={() => setIsCreatingNewDisplayShown(true)}>Record new time</button>
                    )}
                </div>
            )}

            {
                usedEndpoint.pending && (
                    <p>Pending...</p>
                )
            }
            {
                usedEndpoint.error && (
                    <p>Couldn't load news :'(</p>
                )
            }
            {usedEndpoint.data && (
                <table>
                    <tr>
                        <th>#</th>
                        <th>name</th>
                        <th>team</th>
                        <th>time</th>
                        <th>note</th>
                        <th>when</th>
                        {currentUser.hasAuthority(Authority.SpeedDrinkingEditor) && (
                            <th>edit</th>
                        )}
                    </tr>

                    {
                        usedEndpoint.data.map((speedDrinking, index) => {
                            return (
                                <SpeedDrinkingDisplayContainer
                                    key={speedDrinking.id}
                                    overriddenBeginningEntity={speedDrinking}
                                    shouldCreateNew={false}
                                    displayExtraProps={{
                                        rowNumber: index + 1,
                                        showCategory: false,
                                        showName: true,
                                        showTeam: true,
                                    }}
                                />
                            );
                        })
                    }
                </table>
            )}
        </div>
    );
}

export default SpeedDrinkingPanel;