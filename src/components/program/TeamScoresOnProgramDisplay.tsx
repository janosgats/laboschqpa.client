import {Table, TableCell, TableContainer, TableHead, TableRow, Typography} from '@material-ui/core';
import React, {FC} from 'react';
import useEndpoint from '~/hooks/useEndpoint';
import Spinner from '../Spinner';
import MyPaper from "~/components/mui/MyPaper";
import {TeamWithScoreResponse} from "~/model/TeamWithScoreResponse";
import {separatedPoints} from "~/pages/teams";
import Link from 'next/link';
import getUrlFriendlyString from "~/utils/getUrlFriendlyString";

interface Props {
    programId: number;
}

const TeamScoresOnProgramDisplay: FC<Props> = (props) => {

    const usedEndpoint = useEndpoint<TeamWithScoreResponse[]>({
        conf: {
            url: '/api/up/server/api/program/listTeamScoresOnProgram',
            method: 'get',
            params: {
                programId: props.programId,
            },
        },
        deps: [props.programId],
    });

    return (
        <>
            {usedEndpoint.pending && <Spinner/>}

            {usedEndpoint.failed && <p>Couldn't load team scores on program :'(</p>}

            {usedEndpoint.succeeded && (
                <>
                    <MyPaper>
                        <Typography variant="h4">A programon szerzett pontok</Typography>
                        <br/>
                        <TableContainer
                            component={MyPaper}
                            style={{maxWidth: "calc(100vw - 30vw)", overflow: "auto"}}
                        >
                            <Table size="medium">
                                <TableHead>
                                    <TableRow>
                                        <TableCell variant="head">
                                            <Typography>
                                                <b>Csapat</b>
                                            </Typography>
                                        </TableCell>
                                        <TableCell variant="head" align="right">
                                            <Typography>
                                                <b>Kapott pont</b>
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                {usedEndpoint.data.map((teamWithScore, index) => {
                                    return (
                                        <Link key={teamWithScore.id}
                                              href={`/teams/team/${getUrlFriendlyString(teamWithScore.name)}?id=${teamWithScore.id}`}>
                                            <TableRow hover style={{cursor: 'pointer'}}>
                                                <TableCell>
                                                    <Typography> {teamWithScore.name} </Typography>{' '}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography> {separatedPoints(teamWithScore.score)} </Typography>{' '}
                                                </TableCell>
                                            </TableRow>
                                        </Link>
                                    );
                                })}
                            </Table>
                        </TableContainer>
                    </MyPaper>
                </>
            )}
        </>
    );
};

export default TeamScoresOnProgramDisplay;
