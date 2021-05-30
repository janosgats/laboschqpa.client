import React, {FC, useState} from "react";
import useEndpoint, {UsedEndpoint} from "~/hooks/useEndpoint";
import {AddNewEmailAddressDialog} from "~/components/email/AddNewEmailAddressDialog";
import {UserEmailAddress} from "~/model/UserEmailAddress";

const EmailAddressesPanel: FC = () => {
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

            {usedCurrentEmailAddresses.error && (
                <>
                    <p>Error while fetching addresses :'(</p>
                    <button onClick={() => usedCurrentEmailAddresses.reloadEndpoint()}>Retry</button>
                </>
            )}
            {usedCurrentEmailAddresses.data && (
                <>
                    <ul>
                        {usedCurrentEmailAddresses.data.map(address => <li key={address.id}>{address.email}</li>)}
                    </ul>

                    <button onClick={() => setAddNewAddressDialogOpen(true)}>Add new e-mail address</button>
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
