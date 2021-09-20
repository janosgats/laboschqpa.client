import {Box, Button, Container, Grid, Link as MuiLink, Typography} from '@material-ui/core';
import AddCircleOutlineOutlinedIcon from '@material-ui/icons/AddCircleOutlineOutlined';
import {NextPage} from 'next';
import Head from 'next/head';
import Link from 'next/link';
import React, {useContext, useMemo, useState} from 'react';
import {ProgramDisplayContainer} from '~/components/fetchableDisplay/FetchableDisplayContainer';
import MyPaper from '~/components/mui/MyPaper';
import Spinner from '~/components/Spinner';
import {CurrentUserContext} from '~/context/CurrentUserProvider';
import {Authority} from '~/enums/Authority';
import useEndpoint from '~/hooks/useEndpoint';
import {Program} from '~/model/usergeneratedcontent/Program';
import DateTimeFormatter from '~/utils/DateTimeFormatter';

const Index: NextPage = () => {
    const currentUser = useContext(CurrentUserContext);

    const [wasCreateNewProgramClicked, setWasCreateNewProgramClicked] = useState<boolean>(false);

    const usedEndpoint = useEndpoint<Program[]>({
        conf: {
            url: '/api/up/server/api/program/listAll',
        },
    });

    return (
        <Container maxWidth="lg">
            <Grid container spacing={2} direction="column">
                <Head>
                    <title>Programok</title>
                </Head>

                {!wasCreateNewProgramClicked && currentUser.hasAuthority(Authority.ProgramEditor) && (
                    <Grid item>
                        <MyPaper>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="large"
                                endIcon={<AddCircleOutlineOutlinedIcon />}
                                onClick={() => setWasCreateNewProgramClicked(true)}
                            >
                                Új program
                            </Button>
                        </MyPaper>
                    </Grid>
                )}

                {wasCreateNewProgramClicked && (
                    <Grid item>
                        <MyPaper>
                            <ProgramDisplayContainer
                                shouldCreateNew={true}
                                onCancelledNewCreation={() => setWasCreateNewProgramClicked(false)}
                            />
                        </MyPaper>
                    </Grid>
                )}

                {usedEndpoint.pending && (
                    <MyPaper>
                        <Spinner />{' '}
                    </MyPaper>
                )}

                {usedEndpoint.failed && (
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
                )}
                {usedEndpoint.succeeded &&
                    new Array(15)
                        .fill(0)
                        .map((_, i) => (
                            <DayRender
                                key={i}
                                programs={usedEndpoint.data}
                                date={new Date(+new Date('2021-09-20T00:00:00Z') - 2 * 60 * 60 * 1000 + i * 24 * 60 * 60 * 1000)}
                            />
                        ))}
            </Grid>
        </Container>
    );
};

export default Index;

interface DayRenderProps {
    programs: Program[];
    date: Date;
}

const DayRender: React.FC<DayRenderProps> = ({programs, date}) => {
    const dayPrograms = useMemo(() => {
        const nextDate = new Date(+date + 24 * 60 * 60 * 1000);
        const overlapDate = new Date(+date + 3 * 60 * 60 * 1000);
        return programs
            .filter(
                (p) =>
                    (new Date(p.startTime) >= date && new Date(p.startTime) < nextDate) ||
                    (new Date(p.startTime) < date && new Date(p.endTime) > overlapDate)
            )
            .sort((a, b) => +a.startTime - +b.startTime);
    }, [date, programs]);

    if (!dayPrograms.length) return null;

    //{dayPrograms.map(p=> <ProgramRender date={date} program={p}>)}
    return (
        <>
            <Grid item>
                <Box mt={4}>
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
                    <ProgramRender date={date} program={p} />
                </Grid>
            ))}
        </>
    );
};

interface ProgramRenderProps {
    program: Program;
    date: Date;
}

const ProgramRender: React.FC<ProgramRenderProps> = ({program, date}) => {
    return (
        <MyPaper>
            <Link href={`/programs/program/${program.title}?id=${program.id}`}>
                <MuiLink underline="none" color="inherit" href={`/programs/program/${program.title}?id=${program.id}`}>
                    <Grid container direction="column" spacing={2}>
                        <Grid item>
                            <Typography variant="h4">{program.title}</Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="h5">{program.headline}</Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="body1">
                                {DateTimeFormatter.toFullShort(program.startTime)} - {DateTimeFormatter.toFullShort(program.endTime)}
                            </Typography>
                        </Grid>
                    </Grid>
                </MuiLink>
            </Link>
        </MyPaper>
    );
};
