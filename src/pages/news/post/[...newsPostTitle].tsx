import {Container, Grid} from '@material-ui/core';
import {NextPage} from 'next';
import {useRouter} from 'next/router';
import React from 'react';
import {NewsPostDisplayContainer} from '~/components/fetchableDisplay/FetchableDisplayContainer';
import Spinner from '~/components/Spinner';
import useEndpoint from '~/hooks/useEndpoint';
import {NewsPost} from "~/model/usergeneratedcontent/NewsPost";

const NewsPostTitle: NextPage = () => {
    const router = useRouter();
    const submissionId = Number.parseInt(router.query['id'] as string);

    const usedEndpoint = useEndpoint<NewsPost>({
        conf: {
            url: '/api/up/server/api/newsPost/newsPost',
            method: 'get',
            params: {
                id: submissionId,
            },
        },
        deps: [submissionId],
        enableRequest: router.isReady,
    });

    return (
        <Container maxWidth="lg">
            {usedEndpoint.pending && <Spinner/>}
            {usedEndpoint.failed && <p>Couldn't load news post :/</p>}

            <Grid container direction="column" spacing={4}>

                {usedEndpoint.succeeded && (
                    <Grid item>
                        <NewsPostDisplayContainer
                            overriddenBeginningEntity={usedEndpoint.data}
                            shouldCreateNew={false}
                        />
                    </Grid>
                )}
            </Grid>
        </Container>
    );
};

export default NewsPostTitle;
