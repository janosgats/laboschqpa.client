import React, {FC, useContext, useState} from 'react'
import useEndpoint from "~/hooks/useEndpoint";
import {NewsPost} from "~/model/usergeneratedcontent/NewsPost";
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import {Authority} from "~/enums/Authority";
import {NewsPostDisplayContainer} from "~/components/fetchableDisplay/FetchableDisplayContainer";

const NewsFeedPanel: FC<{}> = () => {
    const currentUser = useContext(CurrentUserContext);

    const [wasCreateNewPostClicked, setWasCreateNewPostClicked] = useState<boolean>(false);

    const usedEndpoint = useEndpoint<NewsPost[]>({
        conf: {
            url: "/api/up/server/api/newsPost/listAllWithAttachments"
        }
    });

    return (
        <div>
            {(!wasCreateNewPostClicked) && currentUser.hasAuthority(Authority.NewsPostEditor) && (
                <button onClick={() => setWasCreateNewPostClicked(true)}>Create new post</button>
            )}

            {wasCreateNewPostClicked && (
                <NewsPostDisplayContainer
                    shouldCreateNew={true}
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
                        <NewsPostDisplayContainer
                            key={newsPost.id}
                            overriddenBeginningEntity={newsPost}
                            shouldCreateNew={false}
                        />
                    );
                })
            }
        </div>
    );
}

export default NewsFeedPanel;