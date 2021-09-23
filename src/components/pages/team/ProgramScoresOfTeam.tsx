import React, {FC} from "react";
import useEndpoint from "~/hooks/useEndpoint";
import {Program} from "~/model/usergeneratedcontent/Program";
import Spinner from "~/components/Spinner";
import {
    Grid,
    makeStyles,
    Paper,
    Table,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Theme,
    Typography,
    useTheme
} from "@material-ui/core";
import {getStyles} from '~/components/team/styles/TeamStyle';

interface Props {
    teamId: number;
}

const useStyles = makeStyles((theme: Theme) => getStyles(theme))


const ProgramScoresOfTeam: FC<Props> = (props) => {
    const theme = useTheme();
    const usedEndpoint = useEndpoint<Program[]>({
        conf: {
            url: "/api/up/server/api/program/listAllWithTeamScore",
            method: "get",
            params: {
                teamId: props.teamId,
            },
        },
        deps: [props.teamId],
    });

    const separatedPoints = (score: number) => score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    const classes= useStyles();

    return (
        <>

            {usedEndpoint.pending && <Spinner />}

            {usedEndpoint.failed && <p>Couldn't load program scores :'(</p>}

            {usedEndpoint.succeeded && (
                <>
                    <Grid
                        container
                        justify="space-between"
                        style={{
                            paddingLeft: theme.spacing(4),
                            paddingBottom: theme.spacing(2),
                            paddingRight: theme.spacing(4)
                        }}
                    >
                        <Typography variant="h4">Elért pontszám: </Typography>
                        <Typography variant="h4">
                            {separatedPoints(usedEndpoint.data.reduce((sum, program) => sum + program.teamScore, 0))}
                        </Typography>
                    </Grid>


                    <TableContainer 
                        component={Paper}
                        className={classes.tableContainer}
                        >
                        <Table size="medium">
                            <TableHead>
                                <TableRow >
                                    <TableCell variant="head"><Typography ><b>Program</b></Typography></TableCell>
                                    <TableCell variant="head" align="right"><Typography ><b>Kapott pont</b></Typography></TableCell>
                                </TableRow>
                            </TableHead>
                            {usedEndpoint.data
                                .map((program, index) => {
                                    return (
                                        <TableRow
                                            hover
                                        >
                                            <TableCell><Typography> {program.title} </Typography> </TableCell>
                                            <TableCell align="right"><Typography> {separatedPoints(program.teamScore)} </Typography> </TableCell>
                                        </TableRow>
                                    );
                                })}
                        </Table>
                    </TableContainer>
                </>
            )}
        </>
    );
};

export default ProgramScoresOfTeam;
