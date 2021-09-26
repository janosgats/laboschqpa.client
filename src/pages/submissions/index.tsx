import {
    Container,
    createStyles,
    FormControl,
    Grid,
    InputLabel,
    makeStyles,
    Select,
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
import {objectiveTypeData} from '~/enums/ObjectiveType';
import useEndpoint from '~/hooks/useEndpoint';
import {TeamInfo} from '~/model/Team';
import {Objective} from '~/model/usergeneratedcontent/Objective';
import {isValidNumber} from '~/utils/CommonValidators';
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
                    <Grid item lg={4} xs={12} container direction="column" spacing={2}>
                        <Grid item>
                            <FormControl fullWidth component={MyPaper}>
                                <InputLabel id="objective-filter" className={classes.formControlBox}>
                                    Szűrés feladatra
                                </InputLabel>
                                <Select
                                    fullWidth
                                    defaultValue={NOT_FILTERED}
                                    native
                                    labelId="objective-filter"
                                    value={filteredObjectiveId !== null ? filteredObjectiveId : ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (isValidNumber(val.toString())) {
                                            setFilteredObjectiveId(Number.parseInt(e.target.value.toString()));
                                        }
                                        if (val === NOT_FILTERED) {
                                            setFilteredObjectiveId(null);
                                        }
                                    }}
                                >
                                    <option value={NOT_FILTERED}>Nincs</option>
                                    {fetchedObjectives
                                        .filter((item) => item.submittable)
                                        .map((objective) => {
                                            return (
                                                <option key={objective.id} value={objective.id}>
                                                    {`${objectiveTypeData[objective.objectiveType].shortDisplayName} > ${objective.title}`}
                                                </option>
                                            );
                                        })}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <MyPaper>
                                <Typography variant="h4">Szűrés feladatra</Typography>
                                <TableContainer
                                    component={MyPaper}
                                    style={{maxWidth:"calc(100vw - 30vw)", overflow:"auto"}}
                                >
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
                                                fetchedObjectives
                                                    .filter((item) => item.submittable)
                                                    .map((objective: Objective, index: number) => {
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
                    </Grid>

                    <Grid item lg={8} xs={12} container direction="column" spacing={2}>
                        <Grid item>
                            <FormControl fullWidth component={MyPaper}>
                                <InputLabel id="team-filter" className={classes.formControlBox}>
                                    Szűrés csapatra
                                </InputLabel>
                                <Select
                                    fullWidth
                                    defaultValue={NOT_FILTERED}
                                    native
                                    labelId="team-filter"
                                    value={filteredTeamId !== null ? filteredTeamId : ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (isValidNumber(val.toString())) {
                                            setFilteredTeamId(Number.parseInt(e.target.value.toString()));
                                        }
                                        if (val === NOT_FILTERED) {
                                            setFilteredTeamId(null);
                                        }
                                    }}
                                >
                                    <option value={NOT_FILTERED}>Nincs</option>
                                    {fetchedTeams.map((team) => {
                                        return (
                                            <option key={team.id} value={team.id}>
                                                {team.name + (team.archived ? ' (archive)' : '')}
                                            </option>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <SubmissionsPanel filteredObjectiveId={filteredObjectiveId} filteredTeamId={filteredTeamId} />
                        </Grid>
                    </Grid>
                </Grid>
            )}
        </Container>
    );
};

export default Index;
