import { Card, CardContent, createStyles, Grid, makeStyles, Paper, Theme, Typography } from "@material-ui/core";
import { MissedVideoCallRounded } from "@material-ui/icons";
import React, { FC } from "react";
import LoginForm from "~/components/join/LoginForm";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        grid: {
            verticalAlign: 'middle',
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            margin: 'auto',
        },
        paper: {
            padding: "50px",
        }
    }),
);

const LoginWall: FC = () => {
    const classes = useStyles();

    return (
        <Grid
            className={classes.grid}
            container
            direction="column"
            justify="center"
            alignItems="center"
        >
            <Card
                className={classes.paper}
                elevation={3}
                variant="outlined"
            >
                <Grid item xs={12}>
                    <CardContent>
                        <Typography
                            variant="h2"
                        >
                            Log In
                        </Typography>
                    </CardContent>
                </Grid>
                <Grid item xs={12}>
                    <LoginForm />
                </Grid>
            </Card>
        </Grid>
    )
};

export default LoginWall;
