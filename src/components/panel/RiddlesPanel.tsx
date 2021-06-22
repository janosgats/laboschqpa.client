import React, {FC, useState} from 'react'
import useEndpoint from "~/hooks/useEndpoint";
import {AccessibleRiddle} from "~/model/usergeneratedcontent/AccessibleRiddle";
import RiddleSolverDialog from "~/components/riddle/solver/RiddleSolverDialog";

const RiddlesPanel: FC = () => {
    const [isSolveRiddleDialogOpen, setIsSolveRiddleDialogOpen] = useState<boolean>(false);
    const [openedRiddleId, setOpenedRiddleId] = useState<number>();

    const usedEndpoint = useEndpoint<AccessibleRiddle[]>({
        conf: {
            url: "/api/up/server/api/riddle/listAccessibleRiddles"
        }
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
            {usedEndpoint.pending && (
                <p>Pending...</p>
            )}

            {usedEndpoint.failed && (
                <p>Couldn't load riddles :'(</p>
            )}

            {usedEndpoint.succeeded && (
                <table>
                    <thead>
                    <tr>
                        <td>Title</td>
                        <td>Solved?</td>
                        <td>Show it</td>
                    </tr>
                    </thead>
                    <tbody>
                    {usedEndpoint.data.map((riddle, index) => {
                        return (
                            <tr key={riddle.id}>
                                <td>{riddle.title}</td>
                                <td>{riddle.isAlreadySolved ? 'Yes' : 'No'}</td>
                                <td>
                                    <button onClick={() => openRiddle(riddle.id)}>Let me see</button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            )}

            <RiddleSolverDialog
                onClose={(shouldReloadRiddleList: boolean) => {
                    if (shouldReloadRiddleList) {
                        usedEndpoint.reloadEndpoint();
                    }
                    closeRiddle()
                }}
                isOpen={isSolveRiddleDialogOpen}
                id={openedRiddleId}/>
        </div>
    );
}

export default RiddlesPanel;