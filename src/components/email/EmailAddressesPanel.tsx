import {Button, Divider, Grid, List, ListItem, ListItemText} from '@material-ui/core';
import React, {CSSProperties, FC, useState} from 'react';
import {AddNewEmailAddressDialog} from '~/components/email/AddNewEmailAddressDialog';
import useEndpoint, {UsedEndpoint} from '~/hooks/useEndpoint';
import {UserEmailAddress} from '~/model/UserEmailAddress';
import Spinner from '../Spinner';
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import EventBus from "~/utils/EventBus";

interface Overrides {
    ul: CSSProperties;
}

interface Props {
    hideAddNewAddressButton?: boolean;
    overrides?: Overrides;
}

const EmailAddressesPanel: FC<Props> = (props) => {
    const [isAddNewAddressDialogOpen, setAddNewAddressDialogOpen] = useState<boolean>(false);

    const usedCurrentEmailAddresses: UsedEndpoint<UserEmailAddress[]> = useEndpoint<UserEmailAddress[]>({
        conf: {
            url: '/api/up/server/api/emailAddress/listOwnAddresses',
        },
    });

    function deleteEmailAddress(address: UserEmailAddress) {
        if (!confirm(`Are you sure you want to delete ${address.email} and disconnect it from your account?`)) {
            return;
        }

        callJsonEndpoint({
            conf: {
                url: '/api/up/server/api/emailAddress/deleteOwnEmailAddress',
                method: 'delete',
                params: {
                    id: address.id
                }
            }
        }).then(() => {
            EventBus.notifySuccess(address.email, "Address deleted");
            usedCurrentEmailAddresses.reloadEndpoint();
        });
    }

    return (
        <Grid>
            {usedCurrentEmailAddresses.pending && <Spinner/>}

            {usedCurrentEmailAddresses.failed && (
                <>
                    <p>Error while fetching addresses :'(</p>
                    <button onClick={() => usedCurrentEmailAddresses.reloadEndpoint()}>Retry</button>
                </>
            )}
            {usedCurrentEmailAddresses.data && (
                <>
                    <Grid item>
                        <List style={props.overrides?.ul ?? {}}>
                            {usedCurrentEmailAddresses.data.map((address) => (
                                <>
                                    <ListItem key={address.id}>
                                        <ListItemText primary={address.email}/>
                                        <Button color="secondary"
                                                onClick={() => deleteEmailAddress(address)}>Delete</Button>
                                    </ListItem>
                                    <Divider variant="middle"/>
                                </>
                            ))}
                            {!props.hideAddNewAddressButton && (
                                <>
                                    <ListItem>
                                        <Button
                                            variant="text"
                                            size="small"
                                            color="primary"
                                            onClick={() => setAddNewAddressDialogOpen(true)}
                                        >
                                            E-mail cím hozzáadása
                                        </Button>
                                    </ListItem>
                                    <Divider variant="middle"/>
                                </>
                            )}
                        </List>
                    </Grid>
                    <Grid container justify="flex-start"></Grid>
                </>
            )}
            {isAddNewAddressDialogOpen && (
                <AddNewEmailAddressDialog isOpen={isAddNewAddressDialogOpen}
                                          onClose={() => setAddNewAddressDialogOpen(false)}/>
            )}
        </Grid>
    );
};

export default EmailAddressesPanel;
