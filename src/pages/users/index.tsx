import Head from 'next/head'
import {NextPage} from "next";
import React from "react";
import useEndpoint from "~/hooks/useEndpoint";
import {Container, createStyles, makeStyles, Table, TableCell, TableHead, TableRow, Theme} from "@material-ui/core";
import Spinner from "~/components/Spinner";
import MyPaper from "~/components/mui/MyPaper";
import Link from "next/link";
import {UsersPageUserInfo} from "~/model/UserInfo";
import UserNameFormatter from "~/utils/UserNameFormatter";
import {isValidNumber} from "~/utils/CommonValidators";

const styles = {
    tableRow: {
        '&:hover': {
            backgroundColor: 'gray',
        },
        cursor: "pointer",
    },
}
const useStyles = makeStyles((theme: Theme) => createStyles(styles));

const Index: NextPage = () => {
    const classes = useStyles();
    const usedEndpoint = useEndpoint<UsersPageUserInfo[]>({
        conf: {
            url: '/api/up/server/api/user/usersPage/listAllEnabled',
        },
    });

    return (
        <Container maxWidth="lg">
            <Head>
                <title>Users</title>
            </Head>

            {usedEndpoint.pending && <Spinner/>}
            {usedEndpoint.failed && <p>Couldn't load users :'(</p>}
            {usedEndpoint.data && (
                <MyPaper>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Név</TableCell>
                                <TableCell>Csapat</TableCell>
                                <TableCell>#</TableCell>
                            </TableRow>
                        </TableHead>
                        {usedEndpoint.data.map((user: UsersPageUserInfo, index) => {
                            return (
                                <Link href={`/users/user/${UserNameFormatter.getUrlName(user)}?id=${user.userId}`}>
                                    <TableRow className={classes.tableRow}>
                                        <TableCell
                                            style={{cursor: 'hand'}}>{UserNameFormatter.getBasicDisplayName(user)}</TableCell>
                                        <TableCell>{isValidNumber(user.teamId) ? user.teamName : "-"}</TableCell>
                                        <TableCell>{user.userId}</TableCell>
                                    </TableRow>
                                </Link>
                            );
                        })}
                    </Table>
                </MyPaper>
            )}
        </Container>
    );
};

export default Index;
