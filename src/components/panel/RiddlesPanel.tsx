import {makeStyles, TableContainer, Theme, Typography} from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import React, {FC, useState} from 'react';
import RiddleSolverDialog from '~/components/riddle/solver/RiddleSolverDialog';
import useEndpoint from '~/hooks/useEndpoint';
import {AccessibleRiddle} from '~/model/usergeneratedcontent/AccessibleRiddle';
import Spinner from '../Spinner';
import {getStyles} from '~/components/panel/styles/RiddlePanelStyle';
import MyPaper from '../mui/MyPaper';

const useStyles = makeStyles((theme: Theme) => getStyles(theme))

const RiddlesPanel: FC = () => {

    const classes = useStyles()

    const [isSolveRiddleDialogOpen, setIsSolveRiddleDialogOpen] = useState<boolean>(false);
    const [openedRiddleId, setOpenedRiddleId] = useState<number>();

    const usedEndpoint = useEndpoint<AccessibleRiddle[]>({
        conf: {
            url: '/api/up/server/api/riddle/listAccessibleRiddles',
        },
        keepOldDataWhileFetchingNew: true,
    });

    function openRiddle(id: number) {
        setIsSolveRiddleDialogOpen(true);
        setOpenedRiddleId(id);
    }

    function closeRiddle() {
        setIsSolveRiddleDialogOpen(false);
        setOpenedRiddleId(null);
    }

    return (
        <div>
            {usedEndpoint.pending && <Spinner />}

            {usedEndpoint.failed && <p>Couldn't load riddles :'(</p>}

            {usedEndpoint.data && (
                <TableContainer
                    component={MyPaper}
                    style={{ maxWidth: "calc(100vw - 30vw)", overflow: "auto" }}
                >
                    <Table
                        size="medium"
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" ><Typography variant="h5"> <b>Cím</b></Typography></TableCell>
                                <TableCell align="center" ><Typography variant="h5"> <b>Megoldva?</b></Typography></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[...(usedEndpoint.data)].reverse().map((riddle, index) => {
                                return (
                                    <TableRow
                                        key={riddle.id}
                                        onClick={() => openRiddle(riddle.id)}
                                        className={classes.tableRow}
                                    >
                                        <TableCell align="center"><Typography variant="body1">{riddle.title}</Typography></TableCell>
                                        <TableCell align="center"><Typography variant="body1">{riddle.isAlreadySolved ? 'Igen' : 'Nem'}</Typography></TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <RiddleSolverDialog
                onClose={(shouldReloadRiddleList: boolean) => {
                    if (shouldReloadRiddleList) {
                        usedEndpoint.reloadEndpoint();
                    }
                    closeRiddle();
                }}
                isOpen={isSolveRiddleDialogOpen}
                id={openedRiddleId}
            />
        </div>
    );
};

export default RiddlesPanel;
