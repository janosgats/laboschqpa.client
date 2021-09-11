import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";
import MUIPaper from "@material-ui/core/Paper";
import React, { FC, useContext, useState } from "react";
import RiddleEditorDialog from "~/components/riddle/editor/RiddleEditorDialog";
import { CurrentUserContext } from "~/context/CurrentUserProvider";
import { Authority } from "~/enums/Authority";
import useEndpoint from "~/hooks/useEndpoint";
import { Riddle } from "~/model/usergeneratedcontent/Riddle";
import Spinner from "../Spinner";

const RiddleEditorPanel: FC = () => {
  const currentUser = useContext(CurrentUserContext);

  const [isRiddleEditorDialogOpen, setIsRiddleEditorDialogOpen] =
    useState<boolean>(false);
  const [isCreatingNewRiddle, setIsCreatingNewRiddle] = useState<boolean>(true);
  const [editedRiddleId, setEditedRiddleId] = useState<number>();

  const usedEndpoint = useEndpoint<Riddle[]>({
    conf: {
      url: "/api/up/server/api/riddleEditor/listAll",
    },
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
        <Button
          size="small"
          variant="contained"
          onClick={() => startCreatingNewRiddle()}
        >
          Create new riddle
        </Button>
      )}

      {usedEndpoint.pending && <Spinner />}

      {usedEndpoint.failed && <p>Couldn't load riddles :'(</p>}

      {usedEndpoint.succeeded && (
        <MUIPaper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Hint</TableCell>
                <TableCell>Solution</TableCell>
                <TableCell>Edit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usedEndpoint.data.map((riddle, index) => {
                return (
                  <TableRow key={riddle.id}>
                    <TableCell>{riddle.id}</TableCell>
                    <TableCell>{riddle.title}</TableCell>
                    <TableCell>{riddle.hint}</TableCell>
                    <TableCell>{riddle.solution}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => startEditingRiddle(riddle.id)}
                      >
                        edit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </MUIPaper>
      )}

      <RiddleEditorDialog
        onClose={(didEntityChangeHappen) => {
          closeRiddleEditor();
          if (didEntityChangeHappen) {
            usedEndpoint.reloadEndpoint();
          }
        }}
        isOpen={isRiddleEditorDialogOpen}
        isCreatingNew={isCreatingNewRiddle}
        idToEdit={editedRiddleId}
      />
    </div>
  );
};

export default RiddleEditorPanel;
