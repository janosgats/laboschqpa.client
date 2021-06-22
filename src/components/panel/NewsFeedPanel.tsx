import React, {FC, useContext, useState} from 'react'
import useEndpoint from "~/hooks/useEndpoint";
import {NewsPost} from "~/model/usergeneratedcontent/NewsPost";
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import {Authority} from "~/enums/Authority";
import {NewsPostDisplayContainer} from "~/components/fetchableDisplay/FetchableDisplayContainer";
import useInfiniteScroller, {InfiniteScroller} from "~/hooks/useInfiniteScroller";

const NewsFeedPanel: FC = () => {
    const currentUser = useContext(CurrentUserContext);

    const infiniteScroller: InfiniteScroller = useInfiniteScroller({
        startingShowCount: 5
    });

    const [wasCreateNewPostClicked, setWasCreateNewPostClicked] = useState<boolean>(false);

    const usedEndpoint = useEndpoint<NewsPost[]>({
        conf: {
            url: "/api/up/server/api/newsPost/listAllWithAttachments"
        }, onSuccess: (res) => {
            infiniteScroller.setMaxLength(res.data.length);
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

            {usedEndpoint.pending && (
                <p>Pending...</p>
            )}

            {usedEndpoint.failed && (
                <p>Couldn't load news :'(</p>
            )}

            {usedEndpoint.succeeded && (
                <>
                    {usedEndpoint.data.slice(0, infiniteScroller.shownCount).map((newsPost, index) => {
                        return (
                            <NewsPostDisplayContainer
                                key={newsPost.id}
                                overriddenBeginningEntity={newsPost}
                                shouldCreateNew={false}
                            />
                        );
                    })}
                    {infiniteScroller.canShownCountBeIncreased && (
                        <button onClick={() => infiniteScroller.increaseShownCount(5)}>
                            &darr;&darr; Show more &darr;&darr;
                        </button>
                    )}
                </>
            )}
        </div>
    );
}

export default NewsFeedPanel;