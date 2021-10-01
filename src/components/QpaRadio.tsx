import React, {FC} from 'react';
import {Grid, Typography, useTheme} from "@material-ui/core";

const RedSpan: FC = (props) => {
    return (
        <span style={{color: 'orangered'}}>{props.children}</span>
    )
}

const QpaRadio: FC = () => {
    const theme = useTheme();

    const iframeTheme = theme.palette.type === "dark" ? "dark" : "light";
    return (
        <Grid container direction="row" justify="center" justifyContent="center">
            <Grid item container direction="column" spacing={1} justify="center" justifyContent="center">
                <Grid item style={{marginBottom: '-55px'}}>
                    <iframe src={`https://qparadio.sch.bme.hu/public/radio_qpa/embed?theme=${iframeTheme}`}
                            frameBorder="0"
                    />
                </Grid>

                <Grid item>
                    <Typography variant="caption">
                        <i>
                            <a href="https://qparadio.sch.bme.hu" target="_blank"><b><RedSpan>QpaRádió.sch</RedSpan></b></a>
                            &nbsp;<RedSpan>-</RedSpan> Powered
                            by: <RedSpan><b>LabRats</b></RedSpan> & <RedSpan><b>HyperCube</b></RedSpan>
                        </i>
                    </Typography>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default QpaRadio;
