import React, {FC} from "react";
import UserNameFormatter from "~/utils/UserNameFormatter";
import {SpeedDrinkingCategory} from "~/enums/SpeedDrinkingCategory";
import {isValidNumber} from "~/utils/CommonValidators";
import useEndpoint from "~/hooks/useEndpoint";
import {UserInfo} from "~/model/UserInfo";
import SpeedDrinkingCategorySelector from "~/components/selector/SpeedDrinkingCategorySelector";
import {Autocomplete} from "@material-ui/lab";
import {Button, createStyles, Dialog, DialogContent, makeStyles, TextField, Theme,} from "@material-ui/core";
import {dialogStyles} from "~/styles/dialog-styles";

interface Props {
  isOpen: boolean;
  isCreatingNew: boolean;
  isApiCallPending: boolean;

  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;

  drinkerUserId: number;
  setDrinkerUserId: React.Dispatch<React.SetStateAction<number>>;
  time: number;
  setTime: React.Dispatch<React.SetStateAction<number>>;
  category: SpeedDrinkingCategory;
  setCategory: React.Dispatch<React.SetStateAction<SpeedDrinkingCategory>>;
  note: string;
  setNote: React.Dispatch<React.SetStateAction<string>>;
}

const useStyles = makeStyles((theme: Theme) => {
  return createStyles(dialogStyles);
});

function getSelectorOptionLabelForUser(userInfo: UserInfo): string {
  let prefix = "";
  if (userInfo.teamName) {
    prefix = userInfo.teamName + ": ";
  }
  return prefix + UserNameFormatter.getBasicDisplayName(userInfo);
}

const SpeedDrinkingEditor: FC<Props> = (props) => {
  const classes = useStyles();

  const usedEndpointUsers = useEndpoint<UserInfo[]>({
    conf: {
      url: "/api/up/server/api/user/listAllWithTeamName",
    },
  });
  const fetchedUsers = usedEndpointUsers.data;

  return (
    <Dialog open={props.isOpen} onClose={() => props.onCancel()}>
      <DialogContent className={classes.dialogContainer}>
        <>
          {usedEndpointUsers.pending && <p>Pending...</p>}

          {usedEndpointUsers.failed && (
            <>
              <p>Couldn't load users :'(</p>
              <button
                onClick={() => {
                  usedEndpointUsers.reloadEndpoint();
                }}
              >
                Retry
              </button>
            </>
          )}

          {fetchedUsers && (
            <>
              <h2 className={classes.dialogTitle}>Record Time</h2>
              <Autocomplete
                style={{ width: "350px", padding: "10px 0" }}
                options={fetchedUsers}
                getOptionLabel={(userInfo) =>
                  getSelectorOptionLabelForUser(userInfo)
                }
                renderInput={(params) => (
                  <TextField {...params} label="Drinker:" variant="outlined" />
                )}
                value={
                  fetchedUsers.filter(
                    (u) => u.userId === props.drinkerUserId
                  )[0]
                }
                onChange={(e, val: UserInfo) => {
                  if (val && isValidNumber(val.userId)) {
                    props.setDrinkerUserId(val.userId);
                  }
                }}
              />

              <SpeedDrinkingCategorySelector
                value={props.category}
                onChange={props.setCategory}
              />

              <TextField
                style={{ margin: "20px 0 10px 0" }}
                variant="outlined"
                type="number"
                inputProps={{step: 0.01}}
                value={props.time}
                onChange={(e) =>
                  props.setTime(Number.parseFloat(e.target.value))
                }
                label="Time"
              />
              {/* <input
                type="number"
                value={props.time}
                step={0.01}
                onChange={(e) =>
                  props.setTime(Number.parseFloat(e.target.value))
                }
              /> */}

              <TextField
                style={{ margin: "10px 0" }}
                variant="outlined"
                value={props.note}
                onChange={(e) => props.setNote(e.target.value)}
                label="Note"
              />
              {/* <input
                value={props.note}
                onChange={(e) => props.setNote(e.target.value)}
                maxLength={500}
              /> */}

              {props.isCreatingNew && (
                <Button
                  variant="contained"
                  onClick={props.onSave}
                  disabled={props.isApiCallPending}
                >
                  Create
                </Button>
              )}
              {!props.isCreatingNew && (
                <>
                  <Button
                    variant="contained"
                    onClick={props.onSave}
                    disabled={props.isApiCallPending}
                  >
                    Modify
                  </Button>
                  <Button
                    variant="contained"
                    onClick={props.onCancel}
                    disabled={props.isApiCallPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={props.onDelete}
                    disabled={props.isApiCallPending}
                  >
                    Delete
                  </Button>
                </>
              )}
            </>
          )}
        </>
      </DialogContent>
    </Dialog>
  );
};

export default SpeedDrinkingEditor;
