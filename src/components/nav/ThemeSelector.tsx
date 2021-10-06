import React, {FC} from "react";
import {Grid, Icon, Switch} from "@material-ui/core";

interface Props {
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
}

const ThemeSelector: FC<Props> = (props) => {
    return (
        <Grid
            container
            direction="row"
            alignItems="center"
        >

            <Grid item>

                <Icon
                    fontSize="default"
                    color={!props.darkMode ? 'error' : 'disabled'}
                >
                    {'wb_sunny'}
                </Icon>
            </Grid>
            <Grid item>

                <Switch
                    checked={props.darkMode}
                    onChange={() => {
                        props.setDarkMode(!props.darkMode);
                    }}
                />
            </Grid>
            <Grid item>

                <Icon
                    fontSize="default"
                    color={props.darkMode ? 'primary' : 'disabled'}
                >
                    {'nights_stay'}

                </Icon>
            </Grid>
        </Grid>
    )
}

export default ThemeSelector;