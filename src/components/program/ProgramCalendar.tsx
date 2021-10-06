import {Grid} from '@material-ui/core';
import React from 'react';
import MyPaper from '~/components/mui/MyPaper';
import DayProgramsDisplay from '~/components/program/DayProgramsDisplay';
import Spinner from '~/components/Spinner';
import useEndpoint from '~/hooks/useEndpoint';
import {Program} from '~/model/usergeneratedcontent/Program';
import TimeSpan from '~/utils/TimeSpan';

interface ProgramCalendarProps {
    startDate: Date;
    count: number;
    reloaderRef?: React.MutableRefObject<() => void>;
    shouldScrollToToday?: boolean;
}

function isToday(dateToCheck: Date): boolean {
    const today = new Date()
    return dateToCheck.getDate() == today.getDate() &&
        dateToCheck.getMonth() == today.getMonth() &&
        dateToCheck.getFullYear() == today.getFullYear();
}

const ProgramCalendar: React.FC<ProgramCalendarProps> = ({startDate, count, reloaderRef, shouldScrollToToday}) => {
    const usedEndpoint = useEndpoint<Program[]>({
        conf: {
            url: '/api/up/server/api/program/listAll',
        },
    });

    if (reloaderRef) reloaderRef.current = () => usedEndpoint.reloadEndpoint();


    return (
        <Grid container spacing={4} direction="column" justify="flex-end" wrap="nowrap">
            {usedEndpoint.pending && (
                <Grid item>
                    <MyPaper>
                        <Spinner/>
                    </MyPaper>
                </Grid>
            )}

            {usedEndpoint.failed && (
                <Grid item>
                    <MyPaper>
                        <p>Couldn't load programs :'(</p>
                        <button
                            onClick={() => {
                                usedEndpoint.reloadEndpoint();
                            }}
                        >
                            Retry
                        </button>
                    </MyPaper>
                </Grid>
            )}
            {usedEndpoint.succeeded &&
            TimeSpan.asDate(TimeSpan.range(startDate, count, TimeSpan.day)).map((date, i) => (
                <DayProgramsDisplay key={i} allPrograms={usedEndpoint.data} date={date}
                                    shouldScrollIntoView={shouldScrollToToday && isToday(date)}/>
            ))}
        </Grid>
    );
};

export default ProgramCalendar;
