import Head from 'next/head'
import { NextPage } from "next";
import React, { useState } from "react";
import { objectiveTypeData } from "~/enums/ObjectiveType";
import SubmissionsPanel from "~/components/panel/SubmissionsPanel";
import { isValidNumber } from "~/utils/CommonValidators";
import useEndpoint from "~/hooks/useEndpoint";
import { Objective } from "~/model/usergeneratedcontent/Objective";
import { TeamInfo } from "~/model/Team";
import NotAcceptedByEmailBanner from "~/components/banner/NotAcceptedByEmailBanner";
import { Box, createStyles, FormControl, Grid, InputLabel, List, ListItem, makeStyles, Paper, Select, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, Theme, Typography } from '@material-ui/core';
import  styles  from './styles/submissions.index.styles';
import DateTimeFormatter from '~/utils/DateTimeFormatter';

const NOT_FILTERED = 'not_filtered';

const useStyles = makeStyles((theme: Theme) =>
    createStyles(styles)
)

const Index: NextPage = () => {
    const [filteredObjectiveId, setFilteredObjectiveId] = useState<number>(null);
    const [filteredTeamId, setFilteredTeamId] = useState<number>(null);

    const usedEndpointObjectives = useEndpoint<Objective[]>({
        conf: {
            url: "/api/up/server/api/objective/listAll",
        }
    });
    const fetchedObjectives = usedEndpointObjectives.data;

    const usedEndpointTeams = useEndpoint<TeamInfo[]>({
        conf: {
            url: "/api/up/server/api/team/listAll",
        }
    });
    const fetchedTeams = usedEndpointTeams.data;

    const classes = useStyles();

    return (
        <>
            <Head>
                <title>Submissions</title>
            </Head>

            <NotAcceptedByEmailBanner />

            {(usedEndpointObjectives.pending || usedEndpointTeams.pending) && (
                <p>Pending...</p>
            )}

            {(usedEndpointObjectives.failed || usedEndpointTeams.failed) && (
                <>
                    <p>Couldn't load teams and objectives :'(</p>
                    <button onClick={() => {
                        usedEndpointObjectives.reloadEndpoint();
                        usedEndpointTeams.reloadEndpoint();
                    }}>
                        Retry
                    </button>
                </>
            )}

            {fetchedObjectives && fetchedTeams && (
                <>
                    <Grid
                        container
                        direction="row"
                        justify="space-between"
                        spacing={3}
                    >
                        <Grid
                            item
                            lg={4}
                            md={12}
                        >
                            <FormControl fullWidth component={Paper}
                                className={classes.formControl}
                            >
                                <Box
                                    className={classes.formControlBox}
                                >
                                    <InputLabel id="objective-filter" className={classes.formControlBox}>Szűrés feladatra</InputLabel>
                                    <Select
                                        fullWidth
                                        native
                                        labelId="objective-filter"
                                        value={filteredObjectiveId !== null ? filteredObjectiveId : ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (isValidNumber(val.toString())) {
                                                console.log("FASZ XD")
                                                setFilteredObjectiveId(Number.parseInt(e.target.value.toString()));
                                            }
                                            if (val === NOT_FILTERED) {
                                                setFilteredObjectiveId(null);
                                            }
                                        }}>
                                        <option value={NOT_FILTERED}></option>
                                        {fetchedObjectives.map(objective => {
                                            return (
                                                <option key={objective.id} value={objective.id}>
                                                    {`${objectiveTypeData[objective.objectiveType].shortDisplayName} > ${objective.title}`}
                                                </option>
                                            );
                                        })}

                                    </Select>
                                </Box>
                            </FormControl>
                            <TableContainer 
                                component={Paper}
                                className={classes.objectiveTableContainer}
                            >
                                <Table size="small"
                                    className={classes.objectiveTable}
                                >
                                    <TableHead
                                    >  
                                        <TableRow >
                                            <TableCell variant="head"><b>Feladat</b></TableCell>
                                            <TableCell variant="head"><b>Status</b></TableCell>
                                            <TableCell variant="head"><b>Határidő</b></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {fetchedObjectives && fetchedObjectives.map((objective: Objective, index: number) => {
                                            return (
                                                <TableRow
                                                    key={index}
                                                    onClick={() => setFilteredObjectiveId(objective.id)}
                                                    hover
                                                    selected={objective.id === filteredObjectiveId}
                                                >
                                                    <TableCell>{objective.title}</TableCell>
                                                    <TableCell>{objective.submittable ? "Beadható" : "Lejárt"}</TableCell>
                                                    <TableCell>{DateTimeFormatter.toFullBasic(objective.deadline)}</TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                        <Grid
                            item
                            lg={8}
                            md={12}
                        >
                            <FormControl fullWidth component={Paper}
                                className={classes.formControl}
                            >
                                <Box
                                    className={classes.formControlBox}
                                >
                                    <InputLabel id="team-filter" className={classes.formControlBox}>Szűrés csapatra</InputLabel>
                                    <Select
                                        fullWidth
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
                                        }}>

                                        <option value={NOT_FILTERED}></option>
                                        {fetchedTeams.map(team => {
                                            return (
                                                <option key={team.id} value={team.id}>
                                                    {team.name + (team.archived ? ' (archive)' : '')}
                                                </option>
                                            );
                                        })}
                                    </Select>
                                </Box>
                            </FormControl>
                            <SubmissionsPanel filteredObjectiveId={filteredObjectiveId} filteredTeamId={filteredTeamId} />
                        </Grid>
                    </Grid>
                </>
            )}
        </>
    )
};

export default Index;
