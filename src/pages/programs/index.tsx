import Head from 'next/head'
import {NextPage} from "next";
import React, {useContext, useState} from "react";
import {CurrentUserContext} from "~/context/CurrentUserProvider";
import useEndpoint from "~/hooks/useEndpoint";
import {Program} from "~/model/usergeneratedcontent/Program";
import Spinner from "~/components/Spinner";
import Link from "next/link";
import {Authority} from "~/enums/Authority";
import {Button, Grid} from "@material-ui/core";
import AddCircleOutlineOutlinedIcon from "@material-ui/icons/AddCircleOutlineOutlined";
import {ProgramDisplayContainer} from "~/components/fetchableDisplay/FetchableDisplayContainer";


const Index: NextPage = () => {
    const currentUser = useContext(CurrentUserContext);

    const [wasCreateNewProgramClicked, setWasCreateNewProgramClicked] = useState<boolean>(false);

    const usedEndpoint = useEndpoint<Program[]>({
        conf: {
            url: '/api/up/server/api/program/listAll',
        },
    });

    return (
        <div>
            <Head>
                <title>Programok</title>
            </Head>

            {!wasCreateNewProgramClicked && currentUser.hasAuthority(Authority.ProgramEditor) && (
                <Grid item>
                    <Button
                        variant="outlined"
                        color="primary"
                        size="large"
                        endIcon={<AddCircleOutlineOutlinedIcon/>}
                        onClick={() => setWasCreateNewProgramClicked(true)}
                    >
                        Új program
                    </Button>
                </Grid>
            )}

            {wasCreateNewProgramClicked && (
                <Grid item>
                    <ProgramDisplayContainer shouldCreateNew={true}
                                             onCancelledNewCreation={() => setWasCreateNewProgramClicked(false)}/>
                </Grid>
            )}


            <h2>TODO: Naptár nézetes program listázás</h2>
            {usedEndpoint.pending && (
                <Spinner/>
            )}

            {usedEndpoint.failed && (
                <>
                    <p>Couldn't load programs :'(</p>
                    <button
                        onClick={() => {
                            usedEndpoint.reloadEndpoint();
                        }}
                    >
                        Retry
                    </button>
                </>
            )}

            {usedEndpoint.succeeded && (
                <ul>
                    {usedEndpoint.data.map(program => {
                        return (
                            <li>
                                <Link href={`/programs/program/${program.title}?id=${program.id}`}>
                                    <a>
                                        {program.id} / {program.title} / {program.headline} / {program.startTime} - {program.endTime}
                                    </a>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    )
};

export default Index;
