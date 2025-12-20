'use client';

import { useEffect, useState } from 'react';

export function ClientOnly({ children }: { children: React.ReactNode }) {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        console.log('ClientOnly: Mounting...');
        try {
            setHasMounted(true);
            console.log('ClientOnly: Mounted successfully');
        } catch (e) {
            console.error('ClientOnly: Error during mounting', e);
        }
    }, []);

    if (!hasMounted) {
        console.log('ClientOnly: Not mounted yet, returning null');
        return null; // Render nothing on server
    }

    console.log('ClientOnly: Rendering children');
    return <>{children}</>;
}
