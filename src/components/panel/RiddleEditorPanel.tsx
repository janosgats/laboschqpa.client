import React, {FC, useContext, useState} from 'react'
import useEndpoint from "~/hooks/useEndpoint";
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import {Authority} from "~/enums/Authority";
import {Riddle} from "~/model/usergeneratedcontent/Riddle";
import RiddleEditorDialog from "~/components/riddle/editor/RiddleEditorDialog";

const RiddleEditorPanel: FC = () => {
    const currentUser = useContext(CurrentUserContext);

    const [isRiddleEditorDialogOpen, setIsRiddleEditorDialogOpen] = useState<boolean>(false);
    const [isCreatingNewRiddle, setIsCreatingNewRiddle] = useState<boolean>(true);
    const [editedRiddleId, setEditedRiddleId] = useState<number>();

    const usedEndpoint = useEndpoint<Riddle[]>({
        conf: {
            url: "/api/up/server/api/riddleEditor/listAll"
        }
    });

    function startCreatingNewRiddle() {
        setIsRiddleEditorDialogOpen(true);
        setIsCreatingNewRiddle(true);
        setEditedRiddleId(null);
    }

    function startEditingRiddle(id: number) {
        setIsRiddleEditorDialogOpen(true);
        setIsCreatingNewRiddle(false);
        setEditedRiddleId(id);
    }

    function closeRiddleEditor() {
        setIsRiddleEditorDialogOpen(false);
        setEditedRiddleId(null);
    }

    return (
        <div>
            {currentUser.hasAuthority(Authority.RiddleEditor) && (
                <button onClick={() => startCreatingNewRiddle()}>Create new riddle</button>
            )}

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
                        <td>ID</td>
                        <td>Title</td>
                        <td>Hint</td>
                        <td>Solution</td>
                        <td>Edit</td>
                    </tr>
                    </thead>
                    <tbody>
                    {usedEndpoint.data.map((riddle, index) => {
                        return (
                            <tr key={riddle.id}>
                                <td>{riddle.id}</td>
                                <td>{riddle.title}</td>
                                <td>{riddle.hint}</td>
                                <td>{riddle.solution}</td>
                                <td>
                                    <button onClick={() => startEditingRiddle(riddle.id)}>edit</button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            )}

            <RiddleEditorDialog
                onClose={(didEntityChangeHappen) => {
                    closeRiddleEditor()
                    if (didEntityChangeHappen) {
                        usedEndpoint.reloadEndpoint();
                    }
                }}
                isOpen={isRiddleEditorDialogOpen}
                isCreatingNew={isCreatingNewRiddle}
                idToEdit={editedRiddleId}/>
        </div>
    );
}

export default RiddleEditorPanel;