import {Box, CircularProgress} from '@material-ui/core';
import React, {ReactElement} from 'react';

interface Props {}

export default function Spinner({}: Props): ReactElement {
    return (
        <Box width="100%" pt={1} justifyContent="center" display="flex">
            <CircularProgress />;
        </Box>
    );
}
