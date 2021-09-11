import { Button, Grid, List, ListItem, ListItemText } from "@material-ui/core";
import React, { CSSProperties, FC, useState } from "react";
import { AddNewEmailAddressDialog } from "~/components/email/AddNewEmailAddressDialog";
import useEndpoint, { UsedEndpoint } from "~/hooks/useEndpoint";
import { UserEmailAddress } from "~/model/UserEmailAddress";
import Spinner from "../Spinner";

interface Overrides {
  ul: CSSProperties;
}

interface Props {
  hideAddNewAddressButton?: boolean;
  overrides?: Overrides;
}

const EmailAddressesPanel: FC<Props> = (props) => {
  const [isAddNewAddressDialogOpen, setAddNewAddressDialogOpen] =
    useState<boolean>(false);

  const usedCurrentEmailAddresses: UsedEndpoint<UserEmailAddress[]> =
    useEndpoint<UserEmailAddress[]>({
      conf: {
        url: "/api/up/server/api/emailAddress/listOwnAddresses",
      },
    });

  return (
    <Grid>
      {usedCurrentEmailAddresses.pending && <Spinner />}

      {usedCurrentEmailAddresses.failed && (
        <>
          <p>Error while fetching addresses :'(</p>
          <button onClick={() => usedCurrentEmailAddresses.reloadEndpoint()}>
            Retry
          </button>
        </>
      )}
      {usedCurrentEmailAddresses.data && (
        <>
          <Grid item>
            <List style={props.overrides?.ul ?? {}}>
              {usedCurrentEmailAddresses.data.map((address) => (
                <ListItem key={address.id}>
                  <ListItemText primary={address.email} />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid container justify="flex-end">
            {!props.hideAddNewAddressButton && (
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => setAddNewAddressDialogOpen(true)}
              >
                E-mail cím hozzáadása
              </Button>
            )}
          </Grid>
        </>
      )}
      {isAddNewAddressDialogOpen && (
        <AddNewEmailAddressDialog
          isOpen={isAddNewAddressDialogOpen}
          onClose={() => setAddNewAddressDialogOpen(false)}
        />
      )}
    </Grid>
  );
};

export default EmailAddressesPanel;
