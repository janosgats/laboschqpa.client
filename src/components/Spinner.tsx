import {Box, CircularProgress} from '@material-ui/core';
import React, {ReactElement} from 'react';

interface Props {
    minWidth?: any;
}

export default function Spinner({minWidth}: Props): ReactElement {
    return (
        <Box width="100%" pt={1} minWidth={minWidth} justifyContent="center" display="flex">
            <CircularProgress />
        </Box>
    );
}
