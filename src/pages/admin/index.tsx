import Head from 'next/head'
import {NextPage} from "next";
import React from "react";
import AdminNavBar from "~/components/nav/AdminNavBar";
import NavigateAwayIfUserIsNotAdmin from "~/components/admin/NavigateAwayIfUserIsNotAdmin";


const Index: NextPage = () => {
    const currentUser = useContext(CurrentUserContext);
    const router = useRouter();

            <NavigateAwayIfUserIsNotAdmin/>
            <AdminNavBar/>

                    <AdminNavBar />

                    <p>Admin home</p>
                </div>
            </>
        )
    );
};

export default Index;
