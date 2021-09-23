import {alpha, Paper, useTheme} from '@material-ui/core';
import {BorderRadiusProperty} from 'csstype';
import React, {ReactElement} from 'react';

interface MyPaperProps {
    p?: number;
    opacity?: number;
    variant?: 'outlined' | 'elevation';
    borderRadius?: BorderRadiusProperty<string | 0>;
    style?: React.CSSProperties;
}

export default function MyPaper({
    children,
    p = 2,
    opacity = 0.8,
    variant = 'elevation',
    borderRadius = '.25rem',
    style = {},
}: React.PropsWithChildren<MyPaperProps>): ReactElement {
    const theme = useTheme();
    return (
        <Paper
            variant={variant}
            style={{
                height: '100%',
                backgroundColor: alpha(theme.palette.background.paper, opacity),
                borderRadius: borderRadius,
                padding: theme.spacing(p),
                overflow: 'hidden',
                ...style,
            }}
        >
            {children}
        </Paper>
    );
}
