import {Box, Grid, Typography} from '@material-ui/core';
import React, {useMemo} from 'react';
import MyPaper from '~/components/mui/MyPaper';
import {Program} from '~/model/usergeneratedcontent/Program';
import DateTimeFormatter from '~/utils/DateTimeFormatter';
import TimeSpan from '~/utils/TimeSpan';
import ProgramDisplay from './ProgramDisplay';

interface DayProgramsDisplayProps {
    programs: Program[];
    date: Date;
}

const DayProgramsDisplay: React.FC<DayProgramsDisplayProps> = ({programs, date}) => {
    const dayPrograms = useMemo(() => {
        const nextDate = new Date(+date + TimeSpan.day);
        const overlapDate = new Date(+date + 5 * TimeSpan.hour);
        return programs
            .filter(
                (p) =>
                    (new Date(p.startTime) >= date && new Date(p.startTime) < nextDate) ||
                    (new Date(p.startTime) < date && new Date(p.endTime) > overlapDate)
            )
            .sort((a, b) => +a.startTime - +b.startTime);
    }, [date, programs]);

    if (!dayPrograms.length) return null;

    return (
        <>
            <Grid item>
                <Box mt={6}>
                    <MyPaper>
                        <Grid container justifyContent="center">
                            <Typography variant="h4">
                                {DateTimeFormatter.toDay(date)} (
                                {['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'][date.getDay() % 7]})
                            </Typography>
                        </Grid>
                    </MyPaper>
                </Box>
            </Grid>
            {dayPrograms.map((p) => (
                <Grid item key={p.id}>
                    <ProgramDisplay date={date} program={p} />
                </Grid>
            ))}
        </>
    );
};

export default DayProgramsDisplay;
