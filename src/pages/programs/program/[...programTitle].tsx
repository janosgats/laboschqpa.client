import {NextPage} from 'next';
import {useRouter} from 'next/router';
import React, {useContext} from 'react';
import {UserNameContainer} from '~/model/UserInfo';
import ObjectivesBelongingToProgramPanel from "~/components/panel/ObjectivesBelongingToProgramPanel";
import {ProgramDisplayContainer} from "~/components/fetchableDisplay/FetchableDisplayContainer";
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import useEndpoint from "~/hooks/useEndpoint";
import Spinner from "~/components/Spinner";
import MyPaper from "~/components/mui/MyPaper";
import {prefixWordWithArticle} from "~/utils/wordPrefixingUtils";
import TeamScoreResponse from "~/model/TeamScoreResponse";

interface TeamMember extends UserNameContainer {
    userId: number;
    profilePicUrl: string;
    teamRole: number;
}

const Index: NextPage = () => {
    const router = useRouter();
    const programId = Number.parseInt(router.query['id'] as string);

    const currentUser = useContext(CurrentUserContext);


    const usedEndpoint = useEndpoint<TeamScoreResponse>({
        conf: {
            url: "/api/up/server/api/program/teamScore",
            method: "get",
            params: {
                teamId: currentUser.getUserInfo()?.teamId,
                programId: programId,
            },
        },
        deps: [currentUser.getUserInfo()?.teamId, programId],
        enableRequest: !!currentUser.getUserInfo(),
    });


    return (
        <>
            {router.isReady && (
                <>
                    <ProgramDisplayContainer entityId={programId} shouldCreateNew={false}/>

                    <br/>
                    <MyPaper>
                        {usedEndpoint.pending && <Spinner/>}
                        {usedEndpoint.failed && <p>Couldn't load team score on this Program :/ </p>}
                        {usedEndpoint.succeeded && (
                            <p>
                                {prefixWordWithArticle(currentUser.getUserInfo()?.teamName, true)} pontszáma
                                ezen a programon: {usedEndpoint.data.teamScore}
                            </p>
                        )}
                    </MyPaper>

                    <h1>A programhoz kapcsolódó feladatok</h1>
                    <ObjectivesBelongingToProgramPanel programId={programId}/>
                </>
            )}
        </>
    )
};

export default Index;
