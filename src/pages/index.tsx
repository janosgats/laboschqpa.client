import Head from 'next/head'
import styles from '../styles/Home.module.css'
import {NextPage} from "next";
import React, {useContext, useEffect, useState} from "react";
import EventBus from "~/utils/EventBus";
import 'react-notifications/lib/notifications.css';
import callJsonEndpoint from "~/utils/api/callJsonEndpoint";
import RegisterForm from "~/components/join/RegisterForm";
import LoginForm from "~/components/join/LoginForm";
import LogoutForm from "~/components/join/LogoutForm";
import {CurrentUserContext} from "~/context/CurrentUserProvider";


const Index: NextPage = () => {
    const currentUser = useContext(CurrentUserContext);
    const [profileInfo, setProfileInfo] = useState(undefined);

    useEffect(() => {
            callJsonEndpoint({
                url: "/server/api/profileInfo/currentProfileInfo"
            }).then(res => setProfileInfo(res.data)
            ).catch(() => setProfileInfo("Couldn't load profile info"));

        }, []
    );

    return (
        <div className={styles.container}>
            <Head>
                <title>Create Next App</title>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            <hr/>
            <h4>RegisterForm</h4>
            <RegisterForm/>
            <hr/>
            <h4>LoginForm</h4>
            <LoginForm/>
            <hr/>
            <h4>LogoutForm</h4>
            <LogoutForm/>
            <hr/>

            <button onClick={() =>
                EventBus.notifyInfo("Was clicked", "Button", 10000, () => alert(23543254))
            }>Test Button
            </button>

            <button onClick={() =>
                EventBus.notifySuccess("Was clicked", "Button", 10000, () => alert(634), true)
            }>Test Button Priority
            </button>

            <button onClick={() => currentUser.getUserInfo()}>Gimme UserInfo</button>


                <div style={{borderWidth: 1, borderStyle: "solid", borderColor: "blue"}}>
                    <h3>profile info</h3>
                    <br/>
                    {
                        profileInfo ? JSON.stringify(profileInfo) : "Nothing was loaded yet"
                    }
                </div>

        </div>
    )
};

export default Index;
