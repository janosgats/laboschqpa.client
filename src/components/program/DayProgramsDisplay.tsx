import {Box, Grid, Typography} from '@material-ui/core';
import React, {useMemo} from 'react';
import MyPaper from '~/components/mui/MyPaper';
import {Program} from '~/model/usergeneratedcontent/Program';
import DateTimeFormatter from '~/utils/DateTimeFormatter';
import ProgramDisplay from './ProgramDisplay';
import filterDailyPrograms from "~/components/program/tools/filterDailyPrograms";

interface DayProgramsDisplayProps {
    allPrograms: Program[];
    date: Date;
}

const DayProgramsDisplay: React.FC<DayProgramsDisplayProps> = ({allPrograms, date}) => {
    const dailyPrograms = useMemo(() => filterDailyPrograms(allPrograms, date), [date, allPrograms]);
    if (dailyPrograms.length === 0) {
        return null;
    }

    return (
        <Grid item>
            <Box mb={2}>
                <MyPaper>
                    <Grid container justify="center" alignItems="center">
                        <Typography variant="h4">
                            <b>
                                {['Vasárnap - ', 'Hétfő - ', 'Kedd - ', 'Szerda - ', 'Csütörtök - ', 'Péntek - ', 'Szombat - ', 'Vasárnap - '][date.getDay() % 7]}
                            </b>
                            <i>{DateTimeFormatter.toDay(date)}</i>
                        </Typography>
                    </Grid>
                </MyPaper>
            </Box>
            <Box minHeight="1rem">
                <Grid container direction="row" spacing={2} alignItems="stretch">
                    {dailyPrograms.map((p) => (
                        <Grid item key={p.id} sm={12} md={6} lg={4} xl={3} alignContent="stretch">
                            <ProgramDisplay date={date} program={p}/>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Grid>
    );
};

export default DayProgramsDisplay;
