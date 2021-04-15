import React, {FC} from 'react'
import useEndpoint from "~/hooks/useEndpoint";
import {NewsPost} from "~/model/usergeneratedcontent/NewsPost";
import Head from "next/head";
import FetchableDisplayContainer from "~/components/texteditor/FetchableDisplayContainer";
import NewsPostDisplay from "~/components/texteditor/NewsPostDisplay";

const NewsFeedPanel: FC<{}> = () => {
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
                                entityId={newsPost.id}//TODO: Override entity to not to load again
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