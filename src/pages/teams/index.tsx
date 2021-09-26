import {
    Container,
    makeStyles,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Theme,
    Typography,
} from '@material-ui/core';
import {NextPage} from 'next';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import NotTeamMemberBanner from '~/components/banner/NotTeamMemberBanner';
import MyPaper from '~/components/mui/MyPaper';
import Spinner from '~/components/Spinner';
import {getStyles} from '~/components/team/styles/TeamStyle';
import useEndpoint from '~/hooks/useEndpoint';

interface TeamWithScore {
    id: number;
    name: string;
    archived: boolean;
    score: number;
}

const useStyles = makeStyles((theme: Theme) => getStyles(theme));
const baseUrl = 'https://laboschqpa-public.s3.pl-waw.scw.cloud/static/frontend/qpatrophy/';
const svgEndPoints = ['gold.svg', 'silver.svg', 'bronze.svg'];

export const separatedPoints = (score: number) => score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const Index: NextPage = () => {
    const classes = useStyles();

    const usedEndpoint = useEndpoint<TeamWithScore[]>({
        conf: {
            url: '/api/up/server/api/team/listActiveTeamsWithScores',
        },
    });

    const loadQpaIcon = (index: number) => <img src={baseUrl + svgEndPoints[index]} width={125 - index * 25} height={125 - index * 25} />;

    return (
        <Container maxWidth="lg">
            <Head>
                <title>Teams</title>
            </Head>

            <NotTeamMemberBanner />

            {usedEndpoint.pending && <Spinner />}
            {usedEndpoint.failed && <p>Couldn't load teams :'(</p>}
            {usedEndpoint.data && (
                <MyPaper>
                    <TableContainer
                    component={MyPaper}
                    style={{maxWidth:"calc(100vw - 30vw)", overflow:"auto"}}
                    >
                        <Table size="medium">
                            <TableHead>
                                <TableRow>
                                    <TableCell variant="head" align="center">
                                        <Typography variant="h4">Helyezés</Typography>
                                    </TableCell>
                                    <TableCell variant="head" align="center">
                                        <Typography variant="h4">Csapat név</Typography>
                                    </TableCell>
                                    <TableCell variant="head" align="center">
                                        <Typography variant="h4">Pontszám</Typography>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {usedEndpoint.data.map((team, index) => {
                                    return (
                                        <Link href={`/teams/team/${team.name}?id=${team.id}`}>
                                            <TableRow key={index} hover className={classes.tableRow}>
                                                <TableCell align="center">
                                                    {index < 3 ? loadQpaIcon(index) : <Typography variant="h5">{index + 1}.</Typography>}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="h5">{team.name}</Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="h5">{separatedPoints(team.score)}</Typography>
                                                </TableCell>
                                            </TableRow>
                                        </Link>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </MyPaper>
            )}
        </Container>
    );
};

export default Index;
