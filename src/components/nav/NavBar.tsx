import React, {FC, useContext} from "react";
import Link from "next/link";
import {CurrentUserContext} from "~/context/CurrentUserProvider";

//TODO: Replace with MUI
const NavBar: FC = () => {
    const currentUser = useContext(CurrentUserContext);

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
                &nbsp;
                <Link href="/teams">
                    <button>teams</button>
                </Link>
                &nbsp;
                <Link href="/users">
                    <button>users</button>
                </Link>
            </nav>
        </div>
    )
};

export default NavBar;
