import { withAuthenticationRequired } from '@auth0/auth0-react';
import React, { useEffect, useState } from 'react';
import { getConfig } from '../../config';

type ComponentState = {
    message: string;
};

function MembersOnly() {
    const [appState, setAppState] = useState<ComponentState>({
        message: 'Loading',
    });

    useEffect(() => {
        setAppState({ message: 'Loading' });

        const endpoint = `${getConfig().apiUrl}/hello`;

        fetch(endpoint, { mode: 'cors' })
            .then((res) => {
                const result = res.json();

                return result;
            })
            .then((message) => {
                console.log({ message });

                setAppState({
                    message,
                });
            });
    }, [setAppState, appState]);

    return <div>MESSAGE FROM COSCRAD: {appState.message}</div>;
}

export default withAuthenticationRequired(MembersOnly, {
    onRedirecting: () => <div>Loading ...</div>,
});
