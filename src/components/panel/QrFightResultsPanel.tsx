import React, {FC, useEffect, useState} from "react";
import useEndpoint from "~/hooks/useEndpoint";
import Spinner from "~/components/Spinner";
import MyPaper from "~/components/mui/MyPaper";
import {QrFightArea} from "~/components/qrFight/QrFightTypes";
import QrFightAreaDisplay from "~/components/qrFight/QrFightAreaDisplay";

interface QrFightAreaResponse {
    id: number;
    name: string;
    description: string;
    tagCount: number;
}

interface QrFightStat {
    areaId: number;
    teamId: number;
    teamName: string;
    submissionCount: number;
}

function convertApiDataToDisplayData(areasArray: QrFightAreaResponse[], statisticsArray: QrFightStat[]): QrFightArea[] {
    const areaMap = new Map<number, QrFightArea>();

    areasArray.forEach(area => {
        if (!areaMap.has(area.id)) {
            areaMap.set(area.id, {
                id: area.id,
                name: area.name,
                description: area.description,
                tagCount: area.tagCount,
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

const QrFightResultsPanel: FC = () => {
    const [areaDataToDisplay, setAreaDataToDisplay] = useState<QrFightArea[]>(null);

    const usedAreas = useEndpoint<QrFightAreaResponse[]>({
        conf: {
            url: '/api/up/server/api/qrFight/listEnabledAreasWithTagCount',
        }
    });

    const usedStatistics = useEndpoint<QrFightStat[]>({
        conf: {
            url: '/api/up/server/api/qrFight/fightStats',
        }
    });

    useEffect(() => {
        if (usedAreas.succeeded && usedStatistics.succeeded) {
            const dataToDisplay: QrFightArea[] = convertApiDataToDisplayData(usedAreas.data, usedStatistics.data);
            setAreaDataToDisplay(dataToDisplay)
        }

    }, [usedAreas.succeeded, usedStatistics.succeeded])

    function reloadData() {
        setAreaDataToDisplay(null);
        usedAreas.reloadEndpoint();
        usedStatistics.reloadEndpoint();
    }

    return (
        <div>
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

                {areaDataToDisplay && areaDataToDisplay.map(fightArea => {
                    return <QrFightAreaDisplay key={fightArea.id} fightArea={fightArea}/>
                })}
            </MyPaper>
        </div>
    )
};

export default QrFightResultsPanel;
