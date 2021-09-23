import {alpha, Box, Paper, useTheme} from '@material-ui/core';
import React, {ReactElement} from 'react';
import {BorderRadiusProperty} from "csstype";

interface MyPaperProps {
    p?: number;
    opacity?: number;
    variant?: "outlined" | "elevation";
    borderRadius?: BorderRadiusProperty<string | 0>;
}

export default function MyPaper({
                                    children,
                                    p = 2,
                                    opacity = 0.8,
                                    variant = "elevation",
                                    borderRadius = '.25rem'
                                }: React.PropsWithChildren<MyPaperProps>): ReactElement {
    const theme = useTheme();
    return (
        <Paper
            variant={variant}
            style={{
                height: '100%',
                backgroundColor: alpha(theme.palette.background.paper, opacity),
                borderRadius: borderRadius,
                padding: "16px",
            }}

        >
            <Box height="100%" p={p}>
                {children}
            </Box>
        </Paper>
    );
}
