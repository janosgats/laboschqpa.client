import {alpha, Card, CardContent, createStyles, Grid, makeStyles, Theme, Typography} from '@material-ui/core';
import React, {FC} from 'react';
import LoginForm from '~/components/join/LoginForm';

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
            padding: '50px',
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
        },
    })
);

const LoginWall: FC = () => {
    const classes = useStyles();

    return (
        <Grid className={classes.grid} container direction="column" justify="center" alignContent="center">
            <Card className={classes.paper} variant="elevation">
                <Grid item xs={12} container justify="center" alignContent="center">
                    <CardContent>
                        <Typography variant="h3">Log In</Typography>
                    </CardContent>
                </Grid>
                <LoginForm />
            </Card>
        </Grid>
    );
};

export default LoginWall;
