import Head from 'next/head'
import styles from '../styles/Home.module.css'
import {NextPage} from "next";
import React, {useContext} from "react";
import EventBus from "~/utils/EventBus";
import LoginForm from "~/components/join/LoginForm";
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import AttachmentPanel from "~/components/file/AttachmentPanel";
import useAttachments from "~/hooks/useAttachments";

const Index: NextPage = () => {
    const currentUser = useContext(CurrentUserContext);
    const usedAttachments = useAttachments([])

    return (
        <div className={styles.container}>
            <Head>
                <title>Home</title>
            </Head>

            <hr/>
            <hr/>
            <h4>LoginForm</h4>
            <LoginForm/>
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

            <AttachmentPanel usedAttachments={usedAttachments} isEdited={true}/>

            <div style={{margin: 200}}></div>

        </div>
    )
};

export default Index;
