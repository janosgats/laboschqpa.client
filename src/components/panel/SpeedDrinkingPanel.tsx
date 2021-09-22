import {Button, Table, TableCell, TableHead, TableRow} from '@material-ui/core';
import MUIPaper from '@material-ui/core/Paper';
import React, {FC, useContext, useState} from 'react';
import {SpeedDrinkingDisplayContainer} from '~/components/fetchableDisplay/FetchableDisplayContainer';
import {CurrentUserContext} from '~/context/CurrentUserProvider';
import {Authority} from '~/enums/Authority';
import {SpeedDrinkingCategory} from '~/enums/SpeedDrinkingCategory';
import useEndpoint from '~/hooks/useEndpoint';
import {SpeedDrinking} from '~/model/usergeneratedcontent/SpeedDrinking';
import Spinner from '../Spinner';
import {UniqueValueIndexer} from "~/utils/UniqueValueIndexer";

interface Props {
    filteredCategory: SpeedDrinkingCategory;
    filteredTeamId?: number;
    onlyShowPersonalBests: boolean;
}

const SpeedDrinkingPanel: FC<Props> = (props) => {
    const currentUser = useContext(CurrentUserContext);

    const [isCreatingNewDisplayShown, setIsCreatingNewDisplayShown] = useState<boolean>(false);

    const usedEndpoint = useEndpoint<SpeedDrinking[]>({
        conf: {
            url: '/api/up/server/api/speedDrinking/display/list',
            method: 'post',
            data: {
                category: props.filteredCategory,
                teamId: props.filteredTeamId,
            },
        },
        deps: [props.filteredCategory, props.filteredTeamId],
    });

    const [newlyCreatedSpeedDrinkingIds, setNewlyCreatedSpeedDrinkingIds] = useState<number[]>([]);

    const uniqueValueIndexer = new UniqueValueIndexer(1);

    return (
        <div>
            {currentUser.hasAuthority(Authority.SpeedDrinkingEditor) && (
                <div style={{borderStyle: 'solid', borderColor: 'orange'}}>
                    <h4>Times newly recorded by you</h4>

                    {(isCreatingNewDisplayShown || newlyCreatedSpeedDrinkingIds.length > 0) && (
                        <>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>#</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Team</TableCell>
                                        <TableCell>Time</TableCell>
                                        <TableCell>Note</TableCell>
                                        <TableCell>When</TableCell>
                                        <TableCell>Edit</TableCell>
                                    </TableRow>
                                </TableHead>
                                {newlyCreatedSpeedDrinkingIds.map((id, index) => {
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
                                })}
                                {isCreatingNewDisplayShown && (
                                    <TableRow>
                                        <SpeedDrinkingDisplayContainer
                                            shouldCreateNew={true}
                                            displayExtraProps={{
                                                showCategory: true,
                                                showName: true,
                                                showTeam: true,
                                            }}
                                            onCreatedNew={(id) => {
                                                setNewlyCreatedSpeedDrinkingIds([...newlyCreatedSpeedDrinkingIds, id]);
                                                setIsCreatingNewDisplayShown(false);
                                            }}
                                            onCancelledNewCreation={() => setIsCreatingNewDisplayShown(false)}
                                        />
                                    </TableRow>
                                )}
                            </Table>
                        </>
                    )}
                    {!isCreatingNewDisplayShown && (
                        <Button size="small" variant="contained" onClick={() => setIsCreatingNewDisplayShown(true)} color="primary">
                            Record new time
                        </Button>
                    )}
                </div>
            )}

            {usedEndpoint.pending && <Spinner/>}
            {usedEndpoint.failed && <p>Couldn't load speed drinking results :'(</p>}
            {usedEndpoint.data && (
                <>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Team</TableCell>
                                <TableCell>Time</TableCell>
                                <TableCell>Note</TableCell>
                                <TableCell>When</TableCell>
                                {currentUser.hasAuthority(Authority.SpeedDrinkingEditor) && <TableCell>Edit</TableCell>}
                            </TableRow>
                        </TableHead>
                        {usedEndpoint.data
                            .map((speedDrinking, index) => {
                                if (props.onlyShowPersonalBests && uniqueValueIndexer.isAlreadyIndexed(speedDrinking.drinkerUserId)) {
                                    return null;
                                }
                                if (props.filteredTeamId != null && props.filteredTeamId != speedDrinking.drinkerTeamId) return null;
                                return (
                                    <SpeedDrinkingDisplayContainer
                                        key={speedDrinking.id}
                                        overriddenBeginningEntity={speedDrinking}
                                        shouldCreateNew={false}
                                        displayExtraProps={{
                                            rowNumber: uniqueValueIndexer.getIndex(speedDrinking.drinkerUserId),
                                            showCategory: false,
                                            showName: true,
                                            showTeam: true,
                                        }}
                                    />
                            );
                        })}
                    </Table>
                </>
            )}
        </div>
    );
};

export default SpeedDrinkingPanel;
