import { withAuthenticationRequired } from '@auth0/auth0-react';
import { Loading } from '../loading';

function MembersOnly() {
    return <div>Welcome, VIP!</div>;
}

export default withAuthenticationRequired(MembersOnly, {
    onRedirecting: () => <Loading />,
});
