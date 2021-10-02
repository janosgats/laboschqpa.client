import {alpha, Paper, useTheme} from '@material-ui/core';
import {BorderRadiusProperty} from 'csstype';
import React, {MutableRefObject, ReactElement, useEffect, useRef} from 'react';

interface MyPaperProps {
    p?: number;
    opacity?: number;
    variant?: 'outlined' | 'elevation';
    borderRadius?: BorderRadiusProperty<string | 0>;
    elevation?: number;
    style?: React.CSSProperties;
    shouldScrollIntoView?: boolean;
}

function scrollIntoView(ref: MutableRefObject<any>) {
    ref.current.scrollIntoView({behavior: 'smooth', block: 'start'});
}

export default function MyPaper({
                                    children,
                                    elevation = 1,
                                    p = 2,
                                    opacity = 0.8,
                                    variant = 'elevation',
                                    borderRadius = '.25rem',
                                    style = {},
                                    shouldScrollIntoView = false,
                                }: React.PropsWithChildren<MyPaperProps>): ReactElement {
    const theme = useTheme();

    const paperRef = useRef(null);
    useEffect(() => {
        if (shouldScrollIntoView && paperRef.current) {
            scrollIntoView(paperRef);
            setTimeout(() => scrollIntoView(paperRef), 250);
            setTimeout(() => scrollIntoView(paperRef), 500);
            setTimeout(() => scrollIntoView(paperRef), 1000);
            setTimeout(() => scrollIntoView(paperRef), 1500);
        }
    }, [paperRef.current, shouldScrollIntoView])

    return (
        <Paper
            elevation={elevation}
            variant={variant}
            style={{
                height: '100%',
                backgroundColor: alpha(theme.palette.background.paper, opacity),
                borderRadius: borderRadius,
                padding: theme.spacing(p),
                overflow: 'hidden',
                ...style,
            }}
            ref={paperRef}
        >
            {children}
        </Paper>
    );
}
