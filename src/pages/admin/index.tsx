import Head from 'next/head';
import {NextPage} from 'next';
import React, {useContext} from 'react';
import AdminNavBar from '~/components/nav/AdminNavBar';
import {CurrentUserContext} from '~/context/CurrentUserProvider';
import {Authority} from '~/enums/Authority';
import {useRouter} from 'next/router';
import {once} from 'events';

const Index: NextPage = () => {
    const currentUser = useContext(CurrentUserContext);
    const router = useRouter();

    const navigateToHome = () => {
        router.back();
    };
    return (
        currentUser.getUserInfo() && !currentUser.getUserInfo().authorities.includes(Authority.Admin) && <> {navigateToHome()} </>,
        currentUser.getUserInfo() && currentUser.getUserInfo().authorities.includes(Authority.Admin) && (
            <>
                <div>
                    <Head>
                        <title>Admin</title>
                    </Head>

                    <AdminNavBar />

                    <p>Admin home</p>
                </div>
            </>
        )
    );
};

export default Index;
