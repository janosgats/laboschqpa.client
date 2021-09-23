import {alpha, Box, Paper, useTheme} from '@material-ui/core';
import React, {ReactElement} from 'react';

interface MyPaperProps {
    p?: number;
    opacity?: number;
    variant?: "outlined" | "elevation";
}

export default function MyPaper({children, p = 2, opacity = 0.7, variant="elevation"}: React.PropsWithChildren<MyPaperProps>): ReactElement {
    const theme = useTheme();
    return (
        <Paper
            variant={variant}
            style={{
                height: '100%',
                backgroundColor: alpha(theme.palette.background.paper, opacity),
            }}
        >
            <Box height="100%" p={p}>
                {children}
            </Box>
        </Paper>
    );
}
