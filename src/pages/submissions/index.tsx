import {
    Container,
    createStyles,
    FormControl,
    Grid,
    InputLabel,
    makeStyles,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Theme,
    Typography,
} from '@material-ui/core';
import {NextPage} from 'next';
import Head from 'next/head';
import React, {useEffect, useState} from 'react';
import NotAcceptedByEmailBanner from '~/components/banner/NotAcceptedByEmailBanner';
import MyPaper from '~/components/mui/MyPaper';
import SubmissionsPanel from '~/components/panel/SubmissionsPanel';
import Spinner from '~/components/Spinner';
import useEndpoint from '~/hooks/useEndpoint';
import {TeamInfo} from '~/model/Team';
import {Objective} from '~/model/usergeneratedcontent/Objective';
import {isValidNumber} from '~/utils/CommonValidators';
import DateTimeFormatter from '~/utils/DateTimeFormatter';
import {styles} from '../../styles/submissionStyles/submissionsPage.styles';
import {filterByNormalizedWorldSplit} from "~/utils/filterByNormalizedWorldSplit";
import {Autocomplete} from "@material-ui/lab";
import {useRouter} from "next/router";

const NOT_FILTERED_TEAM_INFO: TeamInfo = {
    id: -99,
    name: 'Nincs szűrés',
    archived: false,
};
const NOT_FILTERED_OBJECTIVE: Partial<Objective> = {
    id: -99,
    title: 'Nincs szűrés',
};

const useStyles = makeStyles((theme: Theme) => createStyles(styles));

const Index: NextPage = () => {
    const classes = useStyles();
    const router = useRouter();

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

    useEffect(() => {
        if (router.isReady) {
            setFilteredObjectiveId(Number.parseInt(router.query['objectiveId'] as string));
            setFilteredTeamId(Number.parseInt(router.query['teamId'] as string));
        }
    }, [router.isReady, router.query['objectiveId'], router.query['teamId']])

    return (
        <Container maxWidth="lg">
            <Head>
                <title>Submissions</title>
            </Head>

            <NotAcceptedByEmailBanner/>
            <br/>

            {(usedEndpointObjectives.pending || usedEndpointTeams.pending) && <Spinner/>}

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

                                <Autocomplete
                                    options={[NOT_FILTERED_OBJECTIVE, ...fetchedObjectives]}
                                    getOptionLabel={(objective: Objective) => objective.title}
                                    renderInput={(params) => <TextField {...params} label="Feladat"
                                                                        variant="outlined"/>}
                                    value={filteredObjectiveId !== null ? fetchedObjectives.filter((t) => t.id === filteredObjectiveId)[0] : NOT_FILTERED_OBJECTIVE}
                                    onChange={(e, val: Objective) => {
                                        if (val === NOT_FILTERED_OBJECTIVE) {
                                            setFilteredObjectiveId(null);
                                            return;
                                        }
                                        if (val && isValidNumber(val.id)) {
                                            setFilteredObjectiveId(Number.parseInt(val.id as any));
                                        }
                                    }}
                                    filterOptions={filterByNormalizedWorldSplit}
                                />

                            </FormControl>
                        </Grid>
                        <Grid item>
                            <MyPaper>
                                <Typography variant="h4">Szűrés feladatra</Typography>
                                <TableContainer
                                    component={MyPaper}
                                    style={{maxWidth: "calc(100vw - 30vw)", overflow: "auto"}}
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

                                <Autocomplete
                                    options={[NOT_FILTERED_TEAM_INFO, ...fetchedTeams]}
                                    getOptionLabel={(team: TeamInfo) => team.name + (team.archived ? ' (archive)' : '')}
                                    renderInput={(params) => <TextField {...params} label="Csapat" variant="outlined"/>}
                                    value={filteredTeamId !== null ? fetchedTeams.filter((t) => t.id === filteredTeamId)[0] : NOT_FILTERED_TEAM_INFO}
                                    onChange={(e, val: TeamInfo) => {
                                        if (val === NOT_FILTERED_TEAM_INFO) {
                                            setFilteredTeamId(null);
                                            return;
                                        }
                                        if (val && isValidNumber(val.id)) {
                                            setFilteredTeamId(Number.parseInt(val.id as any));
                                        }
                                    }}
                                    filterOptions={filterByNormalizedWorldSplit}
                                />

                            </FormControl>
                        </Grid>
                        <Grid item>
                            <SubmissionsPanel filteredObjectiveId={filteredObjectiveId}
                                              filteredTeamId={filteredTeamId}/>
                        </Grid>
                    </Grid>
                </Grid>
            )}
        </Container>
    );
};

export default Index;
