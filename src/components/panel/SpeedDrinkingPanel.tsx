import {Button, Table, TableCell, TableContainer, TableHead, TableRow} from '@material-ui/core';
import React, {FC, useContext, useState} from 'react';
import {SpeedDrinkingDisplayContainer} from '~/components/fetchableDisplay/FetchableDisplayContainer';
import {CurrentUserContext} from '~/context/CurrentUserProvider';
import {Authority} from '~/enums/Authority';
import {SpeedDrinkingCategory} from '~/enums/SpeedDrinkingCategory';
import useEndpoint from '~/hooks/useEndpoint';
import {SpeedDrinking} from '~/model/usergeneratedcontent/SpeedDrinking';
import Spinner from '../Spinner';
import {UniqueValueIndexer} from '~/utils/UniqueValueIndexer';
import MyPaper from '../mui/MyPaper';

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
        <>
            {currentUser.hasAuthority(Authority.SpeedDrinkingEditor) && (
                <div style={{ borderStyle: 'solid', borderColor: 'orange' }}>
                    <h4>Általad rögzített idők</h4>

                    {(isCreatingNewDisplayShown || newlyCreatedSpeedDrinkingIds.length > 0) && (
                        <TableContainer
                            component={MyPaper}
                            style={{maxWidth:"calc(100vw - 30vw)", overflow:"auto"}}
                        >
                            <Table
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell  >#</TableCell>
                                        <TableCell  >Kategória</TableCell>
                                        <TableCell  >Név</TableCell>
                                        <TableCell  >Csapat</TableCell>
                                        <TableCell  >Idő</TableCell>
                                        <TableCell  >Megjegyzés</TableCell>
                                        <TableCell  >Időpont</TableCell>
                                        <TableCell  >Szerkesztés</TableCell>
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
                                                defaultEditorCategory: props.filteredCategory ?? SpeedDrinkingCategory.BEER,
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
                        </TableContainer>
                    )}
                    {!isCreatingNewDisplayShown && (
                        <Button size="small" variant="contained" onClick={() => setIsCreatingNewDisplayShown(true)} color="primary">
                            Record new time
                        </Button>
                    )}
                </div>
            )}

            {usedEndpoint.pending && <Spinner />}
            {usedEndpoint.failed && <p>Couldn't load speed drinking results :'(</p>}
            {usedEndpoint.data && (
                        <TableContainer
                            component={MyPaper}
                            style={{maxWidth:"calc(100vw - 30vw)", overflow:"auto"}}
                        >
                            <Table
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center">Helyezés</TableCell>
                                        <TableCell align="left">Név</TableCell>
                                        <TableCell align="center">Csapat név</TableCell>
                                        <TableCell align="center">Idő</TableCell>
                                        <TableCell align="left">Megjegyzés</TableCell>
                                        <TableCell align="right">Időpont</TableCell>
                                        {currentUser.hasAuthority(Authority.SpeedDrinkingEditor) && <TableCell>Szerkesztés</TableCell>}
                                    </TableRow>
                                </TableHead>
                                {usedEndpoint.data
                                    .map((speedDrinking, index) => {
                                        if (props.onlyShowPersonalBests && uniqueValueIndexer.isAlreadyIndexed(speedDrinking.drinkerUserId)) {
                                            return null;
                                        }

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
                        </TableContainer>
            )
            }
        </ >
    );
};

export default SpeedDrinkingPanel;
