import Head from 'next/head'
import {NextPage} from "next";
import React, {useEffect, useState} from "react";
import useEndpoint from "~/hooks/useEndpoint";
import Spinner from "~/components/Spinner";
import MyPaper from "~/components/mui/MyPaper";

interface QrFightAreaResponse {
    id: number;
    name: string;
}

interface QrFightStat {
    areaId: number;
    teamId: number;
    teamName: string;
    submissionCount: number;
}

interface TeamSubmissionStat {
    teamId: number;
    teamName: string;
    submissionCount: number;
}

interface QrFightArea {
    id: number;
    name: string;
    submissionStats: TeamSubmissionStat[];
}

function convertApiDataToDisplayData(areasArray: QrFightAreaResponse[], statisticsArray: QrFightStat[]): QrFightArea[] {
    const areaMap = new Map<number, QrFightArea>();

    areasArray.forEach(area => {
        if (!areaMap.has(area.id)) {
            areaMap.set(area.id, {
                id: area.id,
                name: area.name,
                submissionStats: [],
            });
        }
    });

    statisticsArray.forEach(statRow => {
        areaMap.get(statRow.areaId).submissionStats.push({
            submissionCount: statRow.submissionCount,
            teamId: statRow.teamId,
            teamName: statRow.teamName
        });
    });

    areaMap.forEach(area => {
        area.submissionStats.sort((a, b) => b.submissionCount - a.submissionCount);
    });

    return (
        [...areaMap]
            .sort((a, b) => a[0] - b[0])
            .map(value => value[1])
    );
}

const Index: NextPage = () => {
    const [dataToDisplay, setDataToDisplay] = useState<QrFightArea[]>(null);

    const usedAreas = useEndpoint<QrFightAreaResponse[]>({
        conf: {
            url: '/api/up/server/api/qrFight/listAllAreas',
        }
    });

    const usedStatistics = useEndpoint<QrFightStat[]>({
        conf: {
            url: '/api/up/server/api/qrFight/fightStats',
        }
    });

    useEffect(() => {
        if (usedAreas.succeeded && usedStatistics.succeeded) {
            setDataToDisplay(convertApiDataToDisplayData(usedAreas.data, usedStatistics.data))
        }

    }, [usedAreas.succeeded, usedStatistics.succeeded])

    function reloadData() {
        setDataToDisplay(null);
        usedAreas.reloadEndpoint();
        usedStatistics.reloadEndpoint();
    }

    return (
        <div>
            <Head>
                <title>QR Fight Report</title>
            </Head>
            <h1>QR Fight - Csapatok befoly??soss??ga egyes ter??leteken</h1>
            <MyPaper>
                {(usedAreas.pending || usedStatistics.pending) && (
                    <Spinner/>
                )}

                {(usedAreas.failed || usedStatistics.failed) && (
                    <>
                        <p>Couldn't load battle report :'(</p>
                        <button onClick={() => reloadData()}>Retry</button>
                    </>
                )}

                {dataToDisplay && (
                    <>
                        {dataToDisplay.map(fightArea => {
                            return (
                                <>
                                    <h2 style={{marginBottom: 0}}>
                                        {fightArea.name}:&nbsp;
                                        {fightArea.submissionStats[0] ? (
                                            <>
                                                <i>{fightArea.submissionStats[0].teamName} k??zben</i>
                                            </>
                                        ) : (
                                            <><i>Senki f??ldje </i></>
                                        )}
                                    </h2>
                                    <ol style={{marginTop: 0}}>

                                        {fightArea.submissionStats.map(teamSubmissionStat => {
                                            return (
                                                <li>
                                                    <p>
                                                        <b>{teamSubmissionStat.teamName}</b> tal??lt <b>{teamSubmissionStat.submissionCount}</b> k??dot
                                                    </p>
                                                </li>
                                            );
                                        })}
                                    </ol>
                                </>
                            );
                        })}
                    </>
                )}
            </MyPaper>
        </div>
    )
};

export default Index;
