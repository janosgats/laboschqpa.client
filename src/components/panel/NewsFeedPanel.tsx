import { Button, Divider, Grid, Typography } from "@material-ui/core";
import AddCircleOutlineOutlinedIcon from "@material-ui/icons/AddCircleOutlineOutlined";
import React, { FC, useContext, useState } from "react";
import { NewsPostDisplayContainer } from "~/components/fetchableDisplay/FetchableDisplayContainer";
import { CurrentUserContext } from "~/context/CurrentUserProvider";
import { Authority } from "~/enums/Authority";
import useEndpoint from "~/hooks/useEndpoint";
import useInfiniteScroller, {
  InfiniteScroller,
} from "~/hooks/useInfiniteScroller";
import { NewsPost } from "~/model/usergeneratedcontent/NewsPost";
import Spinner from "../Spinner";

const NewsFeedPanel: FC = () => {
  const currentUser = useContext(CurrentUserContext);

  const infiniteScroller: InfiniteScroller = useInfiniteScroller({
    startingShowCount: 5,
  });

  const [wasCreateNewPostClicked, setWasCreateNewPostClicked] =
    useState<boolean>(false);

  const usedEndpoint = useEndpoint<NewsPost[]>({
    conf: {
      url: "/api/up/server/api/newsPost/listAllWithAttachments",
    },
    onSuccess: (res) => {
      infiniteScroller.setMaxLength(res.data.length);
    },
  });

  return (
    <div>
      <Grid container direction="row" alignItems="center">
        <Grid item style={{ flexGrow: 1 }}>
          <Typography variant="h3">Hírek</Typography>
        </Grid>
        {!wasCreateNewPostClicked &&
          currentUser.hasAuthority(Authority.NewsPostEditor) && (
            <Grid item>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                endIcon={<AddCircleOutlineOutlinedIcon />}
                onClick={() => setWasCreateNewPostClicked(true)}
              >
                Új poszt
              </Button>
            </Grid>
          )}
      </Grid>

      <Divider style={{ marginBottom: "8px" }} />

      {wasCreateNewPostClicked && (
        <NewsPostDisplayContainer shouldCreateNew={true} />
      )}

      {usedEndpoint.pending && <Spinner />}

      {usedEndpoint.failed && <p>Couldn't load news :'(</p>}

      {usedEndpoint.succeeded && (
        <>
          {usedEndpoint.data
            .slice(0, infiniteScroller.shownCount)
            .map((newsPost, index) => {
              return (
                <NewsPostDisplayContainer
                  key={newsPost.id}
                  overriddenBeginningEntity={newsPost}
                  shouldCreateNew={false}
                />
              );
            })}
          {infiniteScroller.canShownCountBeIncreased && (
            <Grid container justify="center">
              <Button
                size="large"
                variant="text"
                fullWidth
                color="secondary"
                onClick={() => infiniteScroller.increaseShownCount(5)}
                style={{ margin: "8px" }}
              >
                &darr; Show more &darr;
              </Button>
            </Grid>
          )}
        </>
      )}
    </div>
  );
};

export default NewsFeedPanel;
