import React, { FC, useContext, useState } from 'react'
import useEndpoint from "~/hooks/useEndpoint";
import { NewsPost } from "~/model/usergeneratedcontent/NewsPost";
import { CurrentUserContext } from "~/context/CurrentUserProvider";
import { Authority } from "~/enums/Authority";
import { NewsPostDisplayContainer } from "~/components/fetchableDisplay/FetchableDisplayContainer";
import useInfiniteScroller, { InfiniteScroller } from "~/hooks/useInfiniteScroller";
import { Button, Divider, Grid, Typography } from '@material-ui/core';
import AddCircleOutlineOutlinedIcon from '@material-ui/icons/AddCircleOutlineOutlined';

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
            <Grid
                container
                direction="row"
                alignItems="center"
            >
                <Grid item
                    style={{ flexGrow: 1 }}
                >
                    <Typography
                        variant="h3"
                    >
                        News
                    </Typography>
                </Grid>
                {(!wasCreateNewPostClicked) && currentUser.hasAuthority(Authority.NewsPostEditor) && (
                    <Grid item>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="large"
                            endIcon={<AddCircleOutlineOutlinedIcon />}
                            onClick={() => setWasCreateNewPostClicked(true)}
                        >
                            Create new post
                        </Button>
                    </Grid>
                )}
            </Grid>
            
            <Divider />

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