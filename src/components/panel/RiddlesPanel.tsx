import React, { FC, useState } from "react";
import useEndpoint from "~/hooks/useEndpoint";
import { AccessibleRiddle } from "~/model/usergeneratedcontent/AccessibleRiddle";
import RiddleSolverDialog from "~/components/riddle/solver/RiddleSolverDialog";

import Table from "@material-ui/core/Table";
import TableCell from "@material-ui/core/TableCell";
import MUIPaper from "@material-ui/core/Paper";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import Button from '@material-ui/core/Button';

const RiddlesPanel: FC = () => {
  const [isSolveRiddleDialogOpen, setIsSolveRiddleDialogOpen] =
    useState<boolean>(false);
  const [openedRiddleId, setOpenedRiddleId] = useState<number>();

  const usedEndpoint = useEndpoint<AccessibleRiddle[]>({
    conf: {
      url: "/api/up/server/api/riddle/listAccessibleRiddles",
    },
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
      {usedEndpoint.pending && <p>Pending...</p>}

      {usedEndpoint.failed && <p>Couldn't load riddles :'(</p>}

      {usedEndpoint.succeeded && (
        <MUIPaper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Solved?</TableCell>
                <TableCell>Show it</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usedEndpoint.data.map((riddle, index) => {
                return (
                  <TableRow key={riddle.id}>
                    <TableCell>{riddle.title}</TableCell>
                    <TableCell>{riddle.isAlreadySolved ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <Button variant="contained" onClick={() => openRiddle(riddle.id)}>
                        Let me see
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </MUIPaper>
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
