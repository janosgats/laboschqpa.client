import React, {CSSProperties, FC, useState} from "react";
import useEndpoint, {UsedEndpoint} from "~/hooks/useEndpoint";
import {AddNewEmailAddressDialog} from "~/components/email/AddNewEmailAddressDialog";
import {UserEmailAddress} from "~/model/UserEmailAddress";
import { List, ListItem, ListItemText } from "@material-ui/core";

interface Overrides {
    ul: CSSProperties;
}

interface Props {
    hideAddNewAddressButton?: boolean;
    overrides?: Overrides;
}

const EmailAddressesPanel: FC<Props> = (props) => {
    const [isAddNewAddressDialogOpen, setAddNewAddressDialogOpen] = useState<boolean>(false)

    const usedCurrentEmailAddresses: UsedEndpoint<UserEmailAddress[]> = useEndpoint<UserEmailAddress[]>({
        conf: {
            url: '/api/up/server/api/emailAddress/listOwnAddresses'
        }
    });

    return (
        <div>
            {usedCurrentEmailAddresses.pending && (
                <p>TODO: Display a spinner here</p>
            )}

            {usedCurrentEmailAddresses.failed && (
                <>
                    <p>Error while fetching addresses :'(</p>
                    <button onClick={() => usedCurrentEmailAddresses.reloadEndpoint()}>Retry</button>
                </>
            )}
            {usedCurrentEmailAddresses.data && (
                <>
                    <List style={props.overrides?.ul ?? {}}>
                        {usedCurrentEmailAddresses.data.map(address => <ListItem key={address.id}><ListItemText primary={address.email} /></ListItem>)}
                    </List>

                    {!props.hideAddNewAddressButton && (
                        <button onClick={() => setAddNewAddressDialogOpen(true)}>Add new e-mail address</button>
                    )}
                </>
            )}
            {isAddNewAddressDialogOpen && (
                <AddNewEmailAddressDialog isOpen={isAddNewAddressDialogOpen}
                                          onClose={() => setAddNewAddressDialogOpen(false)}/>
            )}
        </div>
    );
};

export default EmailAddressesPanel;
