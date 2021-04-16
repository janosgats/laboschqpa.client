import React, {FC} from "react";
import Link from "next/link";

const AdminNavBar: FC = () => {
    return (
        <div style={{borderStyle: "solid", borderWidth: 1, borderColor: "orange", padding: 4}}>
            <nav>
                <Link href="/admin/">
                    <button>admin home</button>
                </Link>

                &nbsp;
                <Link href="/admin/users">
                    <button>users</button>
                </Link>
            </nav>
        </div>
    )
};

export default AdminNavBar;
