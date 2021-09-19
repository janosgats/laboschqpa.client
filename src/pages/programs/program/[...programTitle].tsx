import {NextPage} from 'next';
import {useRouter} from 'next/router';
import React from 'react';
import {UserNameContainer} from '~/model/UserInfo';
import ObjectivesBelongingToProgramPanel from "~/components/panel/ObjectivesBelongingToProgramPanel";
import {ProgramDisplayContainer} from "~/components/fetchableDisplay/FetchableDisplayContainer";

interface TeamMember extends UserNameContainer {
    userId: number;
    profilePicUrl: string;
    teamRole: number;
}

const Index: NextPage = () => {
    const router = useRouter();
    const programId = Number.parseInt(router.query['id'] as string);

    return (<>
            {router.isReady && (
                <>
                    <ProgramDisplayContainer entityId={programId} shouldCreateNew={false}/>
                    <br/>
                    <br/>
                    <h1>A programhoz kapcsolódó feladatok</h1>
                    <ObjectivesBelongingToProgramPanel programId={programId}/>
                </>
            )}
        </>
    )
};

export default Index;
