import React, {FC} from 'react';
import {createStyles, Grid, makeStyles, Paper, Theme, Typography,} from '@material-ui/core';


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        footer: {
            position: 'relative',
            left: '0',
            bottom: '0',
            width: '100%',
        },
        footerContainer: {},
    })
);

interface Props {
    darkMode: boolean;
}

interface LogoLinkProps {
    href: string;
}

const LogoLink: FC<LogoLinkProps> = (props) => {
    return (
        <a href={props.href} target="_blank" style={{cursor: 'pointer'}}>
            {props.children}
        </a>
    );
}

const SponsorContainer: FC<Props> = (props) => {
    const {darkMode: darkMode} = props;

    const classes = useStyles();

    let sponsorLogosBaseUrl = 'https://laboschqpa-public.s3.pl-waw.scw.cloud/static/frontend/sponsors/logos/';
    if (darkMode) {
        sponsorLogosBaseUrl += 'darkMode/';
    }


    return (
        <Paper className={classes.footer}>
            <Grid container direction="row" justify="space-evenly" alignItems="center">

                <Grid className={classes.footerContainer} item>
                    <Grid container direction="column" alignItems="center">
                        <Typography variant="h5"><b>Főtámogatónk:</b></Typography>
                        <LogoLink href='https://snapsoft.hu/'>
                            <img style={{width: '280px'}} src={sponsorLogosBaseUrl + 'snapsoft.svg'}/>
                        </LogoLink>
                    </Grid>
                </Grid>

                <Grid className={classes.footerContainer} item>
                    <Grid
                        container direction="column" alignItems="center" justify="center">
                        <Typography variant="h5"><b>Kiemelt támogatóink:</b></Typography>
                        <Grid container justify="center" alignItems="center">
                            <LogoLink
                                href='https://www.mol.hu/hu/karrier/egyetemi-es-kozepiskolai-egyuttmukodesek/egyetemi-hallgatoknak'>
                                <img style={{width: '130px'}} src={sponsorLogosBaseUrl + 'mol.png'}/>
                            </LogoLink>
                            <LogoLink
                                href='https://www.mol.hu/hu/karrier/egyetemi-es-kozepiskolai-egyuttmukodesek/egyetemi-hallgatoknak'>
                                <img style={{width: '130px'}} src={sponsorLogosBaseUrl + 'mol_limo.svg'}/>
                            </LogoLink>
                            <LogoLink href='https://www.novaservices.hu/'>
                                <img style={{width: '130px'}} src={sponsorLogosBaseUrl + 'nova_services.png'}/>
                            </LogoLink>
                            <img style={{width: '130px'}} src={sponsorLogosBaseUrl + 'sci-network.png'}/>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid className={classes.footerContainer} item>
                    <Grid container direction="column" alignItems="center" justify="center">
                        <Typography variant="h5"><b>Támogatóink:</b></Typography>
                        <Grid container direction="row" alignItems="center" justify="center">
                            <LogoLink href='https://schonherz.hu/'>
                                <img style={{width: '110px'}} src={sponsorLogosBaseUrl + 'sch_isiszovi.svg'}/>
                            </LogoLink>
                            <img style={{width: '90px'}} src={sponsorLogosBaseUrl + 'AK.svg'}/>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default SponsorContainer;
