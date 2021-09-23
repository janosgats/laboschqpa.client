import {
    Container,
    createStyles,
    Grid,
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
import React, {useState} from 'react';
import NotAcceptedByEmailBanner from '~/components/banner/NotAcceptedByEmailBanner';
import MyPaper from '~/components/mui/MyPaper';
import SubmissionsPanel from '~/components/panel/SubmissionsPanel';
import Spinner from '~/components/Spinner';
import useEndpoint from '~/hooks/useEndpoint';
import {TeamInfo} from '~/model/Team';
import {Objective} from '~/model/usergeneratedcontent/Objective';
import DateTimeFormatter from '~/utils/DateTimeFormatter';
import {styles} from '../../styles/submissionStyles/submissionsPage.styles';

const NOT_FILTERED = 'not_filtered';

const useStyles = makeStyles((theme: Theme) => createStyles(styles));

const Index: NextPage = () => {
    const [filteredObjectiveId, setFilteredObjectiveId] = useState<number>(null);
    const [filteredTeamId, setFilteredTeamId] = useState<number>(null);

    const usedEndpointObjectives = useEndpoint<Objective[]>({
        conf: {
            url: '/api/up/server/api/objective/listAll',
        },
    });
    const fetchedObjectives = usedEndpointObjectives.data;

    const usedEndpointTeams = useEndpoint<TeamInfo[]>({
        conf: {
            url: '/api/up/server/api/team/listAll',
        },
    });
    const fetchedTeams = usedEndpointTeams.data;

    const classes = useStyles();

    return (
        <Container maxWidth="lg">
            <Head>
                <title>Submissions</title>
            </Head>

            <NotAcceptedByEmailBanner />
            <br />

            {(usedEndpointObjectives.pending || usedEndpointTeams.pending) && <Spinner />}

            {(usedEndpointObjectives.failed || usedEndpointTeams.failed) && (
                <>
                    <p>Couldn't load teams and objectives :'(</p>
                    <button
                        onClick={() => {
                            usedEndpointObjectives.reloadEndpoint();
                            usedEndpointTeams.reloadEndpoint();
                        }}
                    >
                        Retry
                    </button>
                </>
            )}

            {fetchedObjectives && fetchedTeams && (
                <Grid container direction="row" justify="space-between" spacing={3}>
                    <Grid item lg={6} xs={12}>
                        <MyPaper>
                            <Typography variant="h4">Szűrés feladatra</Typography>
                            <TableContainer style={{height: '10rem', overflow: 'auto'}}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell variant="head">
                                                <b>Feladat</b>
                                            </TableCell>
                                            <TableCell variant="head">
                                                <b>Status</b>
                                            </TableCell>
                                            <TableCell variant="head">
                                                <b>Határidő</b>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {fetchedObjectives &&
                                            fetchedObjectives.map((objective: Objective, index: number) => {
                                                return (
                                                    <TableRow
                                                        key={index}
                                                        onClick={() =>
                                                            setFilteredObjectiveId((f) => (f == objective.id ? null : objective.id))
                                                        }
                                                        hover
                                                        className={classes.tableRow}
                                                        selected={objective.id === filteredObjectiveId}
                                                    >
                                                        <TableCell>{objective.title}</TableCell>
                                                        <TableCell>{objective.submittable ? 'Beadható' : 'Lejárt'}</TableCell>
                                                        <TableCell>{DateTimeFormatter.toFullBasic(objective.deadline)}</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </MyPaper>
                    </Grid>

                    <Grid item lg={6} xs={12}>
                        <MyPaper>
                            <Typography variant="h4">Szűrés csapatra</Typography>
                            <TableContainer style={{height: '10rem', overflow: 'auto'}}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell variant="head">
                                                <b>Csapat</b>
                                            </TableCell>
                                            <TableCell variant="head">
                                                <b>Archived</b>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {fetchedTeams &&
                                            fetchedTeams.map((team: TeamInfo, index: number) => {
                                                return (
                                                    <TableRow
                                                        key={index}
                                                        onClick={() => setFilteredTeamId((f) => (f == team.id ? null : team.id))}
                                                        hover
                                                        className={classes.tableRow}
                                                        selected={team.id === filteredTeamId}
                                                    >
                                                        <TableCell>{team.name}</TableCell>
                                                        <TableCell>{team.archived ? 'igen' : ''}</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </MyPaper>
                    </Grid>
                    <Grid item xs={12}>
                        <SubmissionsPanel filteredObjectiveId={filteredObjectiveId} filteredTeamId={filteredTeamId} />
                    </Grid>
                </Grid>
            )}
        </Container>
    );
};

export default Index;
