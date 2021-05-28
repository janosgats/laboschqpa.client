import React, {FC, useState} from "react";
import {Button, Dialog, DialogActions, DialogContent} from "@material-ui/core";
import callJsonEndpoint from "../../utils/api/callJsonEndpoint";
import EventBus from "../../utils/EventBus";
import useEndpoint, {UsedEndpoint} from "../../hooks/useEndpoint";
import {UserInfo} from "../../model/UserInfo";
import {Authority} from "~/enums/Authority";
import {teamRoleData} from "~/enums/TeamRole";
import {UserEmailAddress} from "~/model/UserEmailAddress";
import AuthoritySelector from "~/components/admin/AuthoritySelector";


function removeAuthority(userId: number, authority: Authority): Promise<any> {
    if (!confirm(`Remove '${authority}' of user ${userId}?`)) {
        return;
    }

    return callJsonEndpoint({
        conf: {
            url: '/api/up/server/api/admin/authority/user/delete',
            method: "DELETE",
            params: {
                userId: userId,
                authority: authority,
            }
        }
    }).then(res => EventBus.notifySuccess('Removed'));
}

function addAuthority(userId: number, authority: Authority): Promise<any> {
    if (!confirm(`Add '${authority}' to user ${userId}?`)) {
        return;
    }

    return callJsonEndpoint({
        conf: {
            url: '/api/up/server/api/admin/authority/user/add',
            method: "POST",
            params: {
                userId: userId,
                authority: authority,
            }
        }
    }).then(res => EventBus.notifySuccess('Added'));
}

interface Props {
    onClose: () => void;
    isOpen: boolean;
    userId: number;
}

const EditAuthoritiesDialog: FC<Props> = (props) => {
    const [authoritySelectorValue, setAuthoritySelectorValue] = useState<Authority>(undefined);

    const usedUserInfo: UsedEndpoint<UserInfo> = useEndpoint<UserInfo>({
        conf: {
            url: '/api/up/server/api/user/infoWithAuthorities',
            params: {
                id: props.userId
            }
        },
        deps: [props.userId, props.isOpen],
        enableRequest: props.isOpen,
    });

    const usedEmailAddresses: UsedEndpoint<UserEmailAddress[]> = useEndpoint<UserEmailAddress[]>({
        conf: {
            url: '/api/up/server/api/emailAddress/listAddressesOfUser',
            params: {
                userId: props.userId
            }
        },
        deps: [props.userId, props.isOpen],
        enableRequest: props.isOpen,
    });
    const userInfo: UserInfo = usedUserInfo.data;

    return (
        <Dialog open={props.isOpen} onClose={props.onClose}>
            <DialogContent>
                <button onClick={() => {
                    usedUserInfo.reloadEndpoint();
                    usedEmailAddresses.reloadEndpoint();
                }}>Reload
                </button>
                <br/>

                {usedUserInfo.pending && <p>Pending user info...</p>}
                {usedUserInfo.error && <p>Error while fetching user info :/</p>}

                {usedEmailAddresses.pending && <p>Pending email addresses...</p>}
                {usedEmailAddresses.error && <p>Error while fetching user emails :/</p>}

                {userInfo && usedEmailAddresses.data && (
                    <>
                        <a href={`/users/user/x?id=${userInfo.userId}`}
                           target="_blank"
                           style={{textDecoration: "underline", color: "blue"}}>
                            User ID: {userInfo.userId}
                        </a>
                        <ul>
                            <li>enabled: {userInfo.enabled ? 'true' : 'false'}</li>
                            <li>isAcceptedByEmail: {userInfo.isAcceptedByEmail ? 'true' : 'false'}</li>
                            <li>teamId: {userInfo.teamId}</li>
                            <li>teamRole: {teamRoleData[userInfo.teamRole].displayName}</li>
                        </ul>
                        <label>Emails: </label>
                        <ul>
                            {usedEmailAddresses.data.map(userEmailAddress => {
                                return <li key={userEmailAddress.id}>{userEmailAddress.email}</li>
                            })}
                        </ul>

                        <label>Authorities: </label>
                        <ul>
                            {userInfo.authorities.map(authority => {
                                return <li key={authority}>{authority}</li>
                            })}
                        </ul>

                        <AuthoritySelector value={authoritySelectorValue}
                                           onChange={value => setAuthoritySelectorValue(value)}/>
                        <button onClick={() =>
                            addAuthority(userInfo.userId, authoritySelectorValue as Authority)
                                .then(() => usedUserInfo.reloadEndpoint())
                        }>
                            Add authority
                        </button>
                        <button onClick={() =>
                            removeAuthority(userInfo.userId, authoritySelectorValue as Authority)
                                .then(() => usedUserInfo.reloadEndpoint())
                        }>
                            Remove authority
                        </button>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose} color="secondary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditAuthoritiesDialog;