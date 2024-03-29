import {Grid, Link as MuiLink, Typography} from '@material-ui/core';
import Link from 'next/link';
import React from 'react';
import MyPaper from '~/components/mui/MyPaper';
import {Program} from '~/model/usergeneratedcontent/Program';
import DateTimeFormatter from '~/utils/DateTimeFormatter';
import getUrlFriendlyString from "~/utils/getUrlFriendlyString";

interface ProgramDisplayProps {
    program: Program;
    date: Date;
}

const ProgramDisplay: React.FC<ProgramDisplayProps> = ({program, date}) => {
    return (
        <MyPaper>
            <Link href={`/programs/program/${getUrlFriendlyString(program.title)}?id=${program.id}`}>
                <MuiLink underline="none" color="inherit" href={`/programs/program/${getUrlFriendlyString(program.title)}?id=${program.id}`}>
                    <Grid container direction="column" spacing={2}>
                        <Grid item>
                            <Typography variant="h4">{program.title}</Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="h6">{program.headline}</Typography>
                        </Grid>
                        <Grid item
                              container
                              direction="row"
                              justify="space-between"
                              alignItems="center">
                            <Typography variant="caption">{DateTimeFormatter.toDayMinutes(program.startTime)}</Typography>
                            <Typography variant="caption">{DateTimeFormatter.toDayMinutes(program.endTime)}</Typography>
                        </Grid>
                    </Grid>
                </MuiLink>
            </Link>
        </MyPaper>
    );
};

export default ProgramDisplay;
