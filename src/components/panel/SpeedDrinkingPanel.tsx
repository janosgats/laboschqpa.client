import React, { FC, useContext, useState } from "react";
import useEndpoint from "~/hooks/useEndpoint";
import { CurrentUserContext } from "~/context/CurrentUserProvider";
import { Authority } from "~/enums/Authority";
import { SpeedDrinkingDisplayContainer } from "~/components/fetchableDisplay/FetchableDisplayContainer";
import { SpeedDrinkingCategory } from "~/enums/SpeedDrinkingCategory";
import { SpeedDrinking } from "~/model/usergeneratedcontent/SpeedDrinking";

import MUIPaper from "@material-ui/core/Paper";
import { Button, Table, TableRow, TableHead, TableCell } from "@material-ui/core";

interface Props {
  filteredCategory: SpeedDrinkingCategory;
  filteredTeamId?: number;
}

const SpeedDrinkingPanel: FC<Props> = (props) => {
  const currentUser = useContext(CurrentUserContext);

  const [isCreatingNewDisplayShown, setIsCreatingNewDisplayShown] =
    useState<boolean>(false);

  const usedEndpoint = useEndpoint<SpeedDrinking[]>({
    conf: {
      url: "/api/up/server/api/speedDrinking/display/list",
      method: "post",
      data: {
        category: props.filteredCategory,
        teamId: props.filteredTeamId,
      },
    },
    deps: [props.filteredCategory, props.filteredTeamId],
  });

  const [newlyCreatedSpeedDrinkingIds, setNewlyCreatedSpeedDrinkingIds] =
    useState<number[]>([]);

  return (
    <div>
      {currentUser.hasAuthority(Authority.SpeedDrinkingEditor) && (
        <div style={{ borderStyle: "solid", borderColor: "orange" }}>
          <h4>Times newly recorded by you</h4>

          {(isCreatingNewDisplayShown ||
            newlyCreatedSpeedDrinkingIds.length > 0) && (
            <MUIPaper >
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
                        setNewlyCreatedSpeedDrinkingIds([
                          ...newlyCreatedSpeedDrinkingIds,
                          id,
                        ]);
                        setIsCreatingNewDisplayShown(false);
                      }}
                      onCancelledNewCreation={() =>
                        setIsCreatingNewDisplayShown(false)
                      }
                    />
                  </TableRow>
                )}
              </Table>
            </MUIPaper>
          )}
          {!isCreatingNewDisplayShown && (
            <Button size="small" variant="contained"  onClick={() => setIsCreatingNewDisplayShown(true)}>
              Record new time
            </Button>
          )}
        </div>
      )}

      {usedEndpoint.pending && <p>Pending...</p>}
      {usedEndpoint.failed && <p>Couldn't load news :'(</p>}
      {usedEndpoint.data && (
        <MUIPaper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Team</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Note</TableCell>
                <TableCell>When</TableCell>
                {currentUser.hasAuthority(Authority.SpeedDrinkingEditor) && (
                  <TableCell>Edit</TableCell>
                )}
              </TableRow>
            </TableHead>
            {usedEndpoint.data.map((speedDrinking, index) => {
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
            })}
          </Table>
        </MUIPaper>
      )}
    </div>
  );
};

export default SpeedDrinkingPanel;
