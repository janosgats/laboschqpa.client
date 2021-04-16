import React, {FC, useContext, useState} from 'react'
import useEndpoint from "~/hooks/useEndpoint";
import {NewsPost} from "~/model/usergeneratedcontent/NewsPost";
import Head from "next/head";
import FetchableDisplayContainer from "~/components/texteditor/FetchableDisplayContainer";
import NewsPostDisplay from "~/components/texteditor/NewsPostDisplay";
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import {Authority} from "~/enums/Authority";

const NewsFeedPanel: FC<{}> = () => {
    const currentUser = useContext(CurrentUserContext);

    const [wasCreateNewPostClicked, setWasCreateNewPostClicked] = useState<boolean>(false);

    const usedEndpoint = useEndpoint<NewsPost[]>({
        config: {
            url: "/api/up/server/api/newsPost/listAllWithAttachments"
        }
    });

    return (
        <div>
            <Head>
                <title>News</title>
            </Head>
            {(!wasCreateNewPostClicked) && currentUser.getUserInfo() && currentUser.getUserInfo().authorities.includes(Authority.NewsPostEditor) && (
                <button onClick={() => setWasCreateNewPostClicked(true)}>Create new post</button>
            )}

            {wasCreateNewPostClicked && (
                <FetchableDisplayContainer
                    shouldCreateNew={true}
                    displayComponent={NewsPostDisplay}
                />
            )}

            {
                usedEndpoint.pending && (
                    <p>Pending...</p>
                )
            }
            {
                usedEndpoint.error && (
                    <p>Couldn't load news :'(</p>
                )
            }
            {
                usedEndpoint.data &&
                usedEndpoint.data.map((newsPost, index) => {
                    return (
                        <FetchableDisplayContainer
                            key={newsPost.id}
                            overriddenBeginningEntity={newsPost}
                            shouldCreateNew={false}
                            displayComponent={NewsPostDisplay}
                        />
                    );
                })
            }
        </div>
    );
}

export default NewsFeedPanel;