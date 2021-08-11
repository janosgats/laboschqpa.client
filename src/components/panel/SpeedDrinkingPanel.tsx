import React, { FC, useContext, useState } from "react";
import useEndpoint from "~/hooks/useEndpoint";
import { CurrentUserContext } from "~/context/CurrentUserProvider";
import { Authority } from "~/enums/Authority";
import { SpeedDrinkingDisplayContainer } from "~/components/fetchableDisplay/FetchableDisplayContainer";
import { SpeedDrinkingCategory } from "~/enums/SpeedDrinkingCategory";
import { SpeedDrinking } from "~/model/usergeneratedcontent/SpeedDrinking";

import MUITable from "@material-ui/core/Table";
import MUITableCell from "@material-ui/core/TableCell";
import MUIPaper from "@material-ui/core/Paper";
import MUITableHead from "@material-ui/core/TableHead";
import MUITableRow from "@material-ui/core/TableRow";

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
            <MUIPaper>
              <MUITable>
                <MUITableHead>
                  <MUITableRow>
                    <MUITableCell>#</MUITableCell>
                    <MUITableCell>Category</MUITableCell>
                    <MUITableCell>Name</MUITableCell>
                    <MUITableCell>Team</MUITableCell>
                    <MUITableCell>Time</MUITableCell>
                    <MUITableCell>Note</MUITableCell>
                    <MUITableCell>When</MUITableCell>
                    <MUITableCell>Edit</MUITableCell>
                  </MUITableRow>
                </MUITableHead>
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
                  <MUITableRow>
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
                  </MUITableRow>
                )}
              </MUITable>
            </MUIPaper>
          )}
          {!isCreatingNewDisplayShown && (
            <button onClick={() => setIsCreatingNewDisplayShown(true)}>
              Record new time
            </button>
          )}
        </div>
      )}

      {usedEndpoint.pending && <p>Pending...</p>}
      {usedEndpoint.failed && <p>Couldn't load news :'(</p>}
      {usedEndpoint.data && (
        <MUIPaper>
          <MUITable>
            <MUITableHead>
              <MUITableRow>
              <MUITableCell>#</MUITableCell>
                    <MUITableCell>Name</MUITableCell>
                    <MUITableCell>Team</MUITableCell>
                    <MUITableCell>Time</MUITableCell>
                    <MUITableCell>Note</MUITableCell>
                    <MUITableCell>When</MUITableCell>
                {currentUser.hasAuthority(Authority.SpeedDrinkingEditor) && (
                  <MUITableCell>Edit</MUITableCell>
                )}
              </MUITableRow>
            </MUITableHead>
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
          </MUITable>
        </MUIPaper>
      )}
    </div>
  );
};

export default SpeedDrinkingPanel;
