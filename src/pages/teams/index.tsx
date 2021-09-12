import {alpha, Button, Table, TableCell, TableHead, TableRow, useTheme} from '@material-ui/core';
import MUIPaper from '@material-ui/core/Paper';
import {NextPage} from 'next';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import NotTeamMemberBanner from '~/components/banner/NotTeamMemberBanner';
import Spinner from '~/components/Spinner';
import useEndpoint from '~/hooks/useEndpoint';

interface TeamWithScore {
    id: number;
    name: string;
    archived: boolean;
    score: number;
}

const Index: NextPage = () => {
    const theme = useTheme();

    const usedEndpoint = useEndpoint<TeamWithScore[]>({
        conf: {
            url: '/api/up/server/api/team/listActiveTeamsWithScores',
        },
    });

    return (
        <div>
            <Head>
                <title>Teams</title>
            </Head>

            <NotTeamMemberBanner />

            {usedEndpoint.pending && <Spinner />}
            {usedEndpoint.failed && <p>Couldn't load teams :'(</p>}
            {usedEndpoint.data && (
                <MUIPaper style={{backgroundColor: alpha(theme.palette.background.paper, 0.4)}}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Team Name</TableCell>
                                <TableCell>Score</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        {usedEndpoint.data.map((team, index) => {
                            return (
                                <TableRow>
                                    <TableCell>{team.id}</TableCell>
                                    <TableCell>{team.name}</TableCell>
                                    <TableCell>{team.score}</TableCell>
                                    <TableCell>
                                        <Link href={`/teams/team/${team.name}?id=${team.id}`}>
                                            <Button variant="contained" color="primary">
                                                Show Team
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </Table>
                </MUIPaper>
            )}
        </div>
    );
};

export default Index;
