import Head from 'next/head'
import styles from '../styles/Home.module.css'
import {NextPage} from "next";
import React, {useContext} from "react";
import EventBus from "~/utils/EventBus";
import RegisterForm from "~/components/join/RegisterForm";
import LoginForm from "~/components/join/LoginForm";
import LogoutForm from "~/components/join/LogoutForm";
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import NewsPostDisplay from "~/components/texteditor/NewsPostDisplay";
import FetchableDisplayContainer from "~/components/texteditor/FetchableDisplayContainer";


const Index: NextPage = () => {
    const currentUser = useContext(CurrentUserContext);

    return (
        <div className={styles.container}>
            <Head>
                <title>Home</title>
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

            <FetchableDisplayContainer entityId={3} shouldCreateNew={false} displayComponent={NewsPostDisplay}/>

            <FetchableDisplayContainer shouldCreateNew={true} displayComponent={NewsPostDisplay}/>

            <div style={{margin: 200}}></div>

        </div>
    )
};

export default Index;
