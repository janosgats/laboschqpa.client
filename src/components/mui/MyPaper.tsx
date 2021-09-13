import {alpha, Box, Paper, useTheme} from '@material-ui/core';
import React, {ReactElement} from 'react';

interface MyPaperProps {
    p?: number;
}

export default function MyPaper({children, p = 2}: React.PropsWithChildren<MyPaperProps>): ReactElement {
    const theme = useTheme();
    return (
        <Paper
            style={{
                backgroundColor: alpha(theme.palette.background.paper, 0.9),
            }}
        >
            <Box p={p}>{children}</Box>
        </Paper>
    );
}
