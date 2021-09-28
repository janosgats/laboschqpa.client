import Head from 'next/head'
import {NextPage} from "next";
import React, {FC} from "react";
import useEndpoint from "~/hooks/useEndpoint";
import Spinner from "~/components/Spinner";
import MyPaper from "~/components/mui/MyPaper";
import {useRouter} from "next/router";
import ApiErrorDescriptorException from "~/exception/ApiErrorDescriptorException";
import {
    qrFight_FIGHT_AREA_IS_NOT_ENABLED,
    qrFight_TAG_DOES_NOT_EXIST,
    qrFight_TAG_SECRET_MISMATCH,
    qrFight_TEAM_RATE_LIMIT_HIT_FOR_QR_FIGHT_SUBMISSIONS,
    qrFight_YOUR_TEAM_ALREADY_SUBMITTED_THIS_TAG,
    teamMembership_YOU_ARE_NOT_IN_A_TEAM
} from "~/enums/ApiErrors";

interface ErrorDetailsProps {
    err: any;
}

const basicErrorJsxElement: JSX.Element = <h1 style={{color: 'red'}}>Nem sikerült érvényesítened a kódot :'(</h1>;

const ErrorDetails: FC<ErrorDetailsProps> = ({err}) => {
    if (!err || !(err instanceof ApiErrorDescriptorException)) {
        return <>{basicErrorJsxElement}</>;
    }
    const apiErrorDescriptor = err.apiErrorDescriptor;

    let errorMessage: string = null;
    let color: string = 'white';
    let showBasicErrorComponent: boolean = true;
    if (teamMembership_YOU_ARE_NOT_IN_A_TEAM.is(apiErrorDescriptor)) {
        errorMessage = 'Egy csapat tagja kell legyél, hogy vadászhasd a kódokat.';
        color = 'yellow';
    } else if (qrFight_YOUR_TEAM_ALREADY_SUBMITTED_THIS_TAG.is(apiErrorDescriptor)) {
        errorMessage = 'A csapatod már beváltotta a kódot. Keress egy másikat :)';
        color = 'lime';
        showBasicErrorComponent = false;
    } else if (qrFight_TAG_DOES_NOT_EXIST.is(apiErrorDescriptor)) {
        errorMessage = 'Ez a cetli nem is létezik :c';
        color = 'red';
    } else if (qrFight_TAG_SECRET_MISMATCH.is(apiErrorDescriptor)) {
        errorMessage = 'Nem nyert, Uram. A kód hibás. Tán félbeszakadt a papíros?';
        color = 'orange';
    } else if (qrFight_TEAM_RATE_LIMIT_HIT_FOR_QR_FIGHT_SUBMISSIONS.is(apiErrorDescriptor)) {
        errorMessage = 'Túl sok érvényesítési próbálkozás a csapatod által. Azért van egy határ :c';
        color = 'red';
    } else if (qrFight_FIGHT_AREA_IS_NOT_ENABLED.is(apiErrorDescriptor)) {
        errorMessage = 'A kód, amit találtál, olyan területhez tartozik, ami (még) nem nyílt meg. Gyere vissza, és scanneld be később :)';
        color = 'yellow';
    }

    if (!errorMessage) {
        return <>{basicErrorJsxElement}</>;
    }
    return (
        <>
            {showBasicErrorComponent && basicErrorJsxElement}
            <h2 style={{color: color}}> {errorMessage}</h2>
        </>
    );
}

const Index: NextPage = () => {
    const router = useRouter();

    function isUrlValid() {
        return !!(router.query['tagId'] && router.query['secret']);
    }

    const usedEndpoint = useEndpoint({
        conf: {
            url: '/api/up/server/api/qrFight/submit',
            method: 'post',
            params: {
                tagId: router.query['tagId'],
                secret: router.query['secret'],
            },
        },
        enableRequest: router.isReady && isUrlValid(),
    });

    return (
        <div>
            <Head>
                <title>QR Fight Submission</title>
            </Head>
            <h1>QR Fight - Submit a Tag</h1>
            <MyPaper>
                {usedEndpoint.pending && (
                    <Spinner/>
                )}

                {usedEndpoint.failed && (
                    <>
                        <ErrorDetails err={usedEndpoint.error}/>
                    </>
                )}

                {router.isReady && !isUrlValid() && (
                    <>
                        <h1 style={{color: 'red'}}>Hibás az URL-ed :/</h1>
                    </>
                )}

                {usedEndpoint.succeeded && (
                    <>
                        <h1 style={{color: 'lime'}}>Sikeresen beváltottad a taget!</h1>
                    </>
                )}
            </MyPaper>
        </div>
    )
};

export default Index;
