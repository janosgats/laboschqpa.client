import React, {FC, useState} from "react";
import {Chart} from "react-google-charts";
import {QrFightArea, TeamSubmissionStat} from "~/components/qrFight/QrFightTypes";
import {Button, Typography, useTheme} from "@material-ui/core";

interface Props {
    fightArea: QrFightArea;
}

const QrFightAreaDisplay: FC<Props> = (props) => {
    const {fightArea} = props;
    const theme = useTheme();

    const [isAllTeamsListOpen, setIsAllTeamsListOpen] = useState<boolean>(false);

    return (
        <>
            <h2 style={{marginBottom: 0}}>
                {fightArea.name}:&nbsp;
                {fightArea.submissionStats[0] ? (
                    <>
                        <i>{fightArea.submissionStats[0].teamName} kezében</i>
                    </>
                ) : (
                    <><i>Senki földje </i></>
                )}
            </h2>
            <p style={{marginBottom: 0, marginTop: 0}}><i>{fightArea.description}</i></p>
            <Typography variant="caption">összesen <b>{fightArea.tagCount}db megtalálható kód</b></Typography>
            {fightArea.submissionStats?.length > 0 && (<>
                    <Chart
                        width={'400px'}
                        chartType="PieChart"
                        loader={<div>Loading Chart</div>}
                        data={[
                            ['Csapat', 'Talált kódok'],
                            ...fightArea.submissionStats
                                .map((stat: TeamSubmissionStat) => [stat.teamName, stat.submissionCount])
                        ]}
                        options={{
                            pieSliceText: 'label',
                            is3D: true,
                            sliceVisibilityThreshold: 0.1,
                            backgroundColor: "transparent",
                            legend: {textStyle: {color: theme.palette.text.primary}},
                            chartArea: {width: '100%', height: '100%'},
                        }}
                    />
                    {!isAllTeamsListOpen && (
                        <Button
                            size="large"
                            variant="text"
                            fullWidth
                            color="secondary"
                            onClick={() => setIsAllTeamsListOpen(true)}
                            style={{margin: '8px'}}
                        >
                            &darr; Mutass minden csapatot &darr;
                        </Button>
                    )}
                    {isAllTeamsListOpen && (
                        <ol style={{marginTop: 0}}>
                            {fightArea.submissionStats.map(teamSubmissionStat => {
                                return (
                                    <li>
                                        <p>
                                            <b>{teamSubmissionStat.teamName}</b> talált <b>{teamSubmissionStat.submissionCount}</b> kódot
                                        </p>
                                    </li>
                                );
                            })}
                        </ol>
                    )}
                </>
            )}
        </>
    )
};

export default QrFightAreaDisplay;
