import React, {ReactElement, useEffect, useState} from 'react';

interface Props {
    children: () => React.ReactNode;
}

export default function ClientRender({children}: Props): ReactElement {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(!!process.browser), []);

    if (!mounted) return null;

    return <>{children()}</>;
}
