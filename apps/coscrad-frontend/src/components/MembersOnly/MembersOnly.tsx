import { withAuthenticationRequired } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import { getConfig } from '../../config';
import { Loading } from '../Loading';

type ComponentState = {
    user: unknown;
};

function MembersOnly() {
    const [appState, setAppState] = useState<ComponentState>({
        user: null,
    });

    useEffect(() => {
        setAppState({ user: null });

        /**
         * TODO[https://www.pivotaltracker.com/story/show/183618729]
         * We need to read the config from context \ a provider.
         */
        const endpoint = `${getConfig().apiUrl}/user`;

        fetch(endpoint, { mode: 'cors' })
            .then((res) => {
                const result = res.json();

                return result;
            })
            .then((result) => {
                setAppState(result);
            });
    }, [setAppState, appState]);

    return <div>COSCRAD USER: {JSON.stringify(appState.user)}</div>;
}

export default withAuthenticationRequired(MembersOnly, {
    onRedirecting: () => <Loading />,
});
