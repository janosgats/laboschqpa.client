import {useMediaQuery, useTheme} from '@material-ui/core';
import React from 'react';

// This component selects the right property for the current screen size
// __<breakpoint> parameter contains the properties for the required size and above

interface ResponsiveProps {
    component: React.ComponentType;
    [key: string]: any;
}

export default function Responsive({component, ...props}: ResponsiveProps) {
    const Component = component;

    const theme = useTheme();
    const matchesWith = [...theme.breakpoints.keys].reduce((output, key) => {
        const matches = useMediaQuery(theme.breakpoints.up(key));
        return matches ? [...output, key] : output;
    }, []) || ['xs'];

    const newProps = matchesWith.reduce((output, key) => (props['__' + key] ? {...output, ...props['__' + key]} : output), props);

    return Component && <Component {...newProps} />;
}

export function WithResponsive(Component: React.ComponentType): React.FC {
    return (props) => <Responsive component={Component} {...props} />;
}
