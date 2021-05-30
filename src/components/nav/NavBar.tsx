import React, {FC, useContext} from "react";
import Link from "next/link";
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import {Authority} from "~/enums/Authority";
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import EventBus from "~/utils/EventBus";
import {useRouter} from "next/router";

const NavBar: FC = () => {
    const router = useRouter();
    const currentUser = useContext(CurrentUserContext);

    function doLogout() {
        callJsonEndpoint({
            conf: {
                url: "/api/up/server/logout",
                method: "POST"
            }
        }).then(res => {
            currentUser.setLoggedInState(false);
            EventBus.notifyInfo("You just logged out", "See you soon")
            router.push("/");
        }).catch((reason) => {
            //TODO: more messages based on the ApiErrorDescriptor
            EventBus.notifyError("Please try again", "We cannot log you out :/")
        });
    }

    return (
        <div style={{borderStyle: "solid", borderWidth: 1, borderColor: "blue", padding: 4}}>
            <nav>
                <Link href="/">
                    <button>home</button>
                </Link>
                &nbsp;
                <Link href={`/users/user/Me/?id=${currentUser.getUserInfo() ? currentUser.getUserInfo().userId : ''}`}>
                    <button>my profile</button>
                </Link>
                {currentUser.isMemberOrLeaderOfAnyTeam() && (
                    <>
                        &nbsp;
                        <Link
                            href={`/teams/team/My/?id=${currentUser.getUserInfo() ? currentUser.getUserInfo().teamId : ''}`}>
                            <button>my team</button>
                        </Link>
                    </>
                )}
                &nbsp;
                <Link href="/teams">
                    <button>teams</button>
                </Link>
                &nbsp;
                <Link href="/users">
                    <button>users</button>
                </Link>
                &nbsp;
                <Link href="/news">
                    <button>news</button>
                </Link>
                &nbsp;
                <Link href="/objectives">
                    <button>objectives</button>
                </Link>
                &nbsp;
                <Link href="/submissions">
                    <button>submissions</button>
                </Link>
                &nbsp;
                <Link href="/speedDrinking">
                    <button>speed drinking</button>
                </Link>

                {currentUser.hasAuthority(Authority.AcceptedEmailEditor) && (
                    <>
                        &nbsp;
                        <Link href="/acceptedEmails">
                            <button>accepted emails</button>
                        </Link>
                    </>
                )}

                {currentUser.hasAuthority(Authority.Admin) && (
                    <>
                        &nbsp;
                        <Link href="/admin">
                            <button>admin</button>
                        </Link>
                    </>
                )}

                &nbsp;
                <button onClick={() => doLogout()}>Logout</button>
            </nav>
        </div>
    )
};

export default NavBar;
