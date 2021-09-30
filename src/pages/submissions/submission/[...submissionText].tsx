import {Container} from '@material-ui/core';
import {NextPage} from 'next';
import {useRouter} from 'next/router';
import React, {useContext} from 'react';
import {SubmissionDisplayContainer} from '~/components/fetchableDisplay/FetchableDisplayContainer';
import MyPaper from '~/components/mui/MyPaper';
import Spinner from '~/components/Spinner';
import {CurrentUserContext} from '~/context/CurrentUserProvider';
import useEndpoint from '~/hooks/useEndpoint';
import {Submission} from "~/model/usergeneratedcontent/Submission";

interface ProgramPageContextProps {
    programId: number;
}

export const ProgramPageContext = React.createContext<ProgramPageContextProps>(null);

const SubmissionText: NextPage = () => {
    const router = useRouter();
    const submissionId = Number.parseInt(router.query['id'] as string);

    const currentUser = useContext(CurrentUserContext);

    const usedEndpoint = useEndpoint<Submission>({
        conf: {
            url: '/api/up/server/api/submission/submission',
            method: 'get',
            params: {
                id: submissionId,
            },
        },
        deps: [currentUser.getUserInfo()?.teamId, submissionId],
        enableRequest: router.isReady && currentUser.isMemberOrLeaderOrApplicantOfAnyTeam(),
    });


    return (
        <Container maxWidth="lg">
            <MyPaper>
                {usedEndpoint.pending && <Spinner/>}
                {usedEndpoint.failed && <p>Couldn't load submission :/</p>}
                {usedEndpoint.succeeded && (
                    <>
                        <SubmissionDisplayContainer
                            overriddenBeginningEntity={usedEndpoint.data}
                            shouldCreateNew={false}
                            displayExtraProps={{
                                showObjectiveTitle: true,
                                showTeamName: true,
                            }}
                        />
                    </>
                )}
            </MyPaper>
        </Container>
    );
};

export default SubmissionText;
