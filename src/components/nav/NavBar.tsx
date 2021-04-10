import React, {FC} from "react";
import Link from "next/link";

//TODO: Replace with MUI
const NavBar: FC = () => {
    return (
        <div style={{borderStyle: "solid", borderWidth: 1, borderColor: "blue", padding: 4}}>
            <nav>
                <Link href="/">
                    <button>home</button>
                </Link>
                &nbsp;
                <Link href="/teams">
                    <button>teams</button>
                </Link>
            </nav>
        </div>
    )
};

export default NavBar;
