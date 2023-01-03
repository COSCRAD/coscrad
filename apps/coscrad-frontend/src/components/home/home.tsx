import { useAuth0 } from '@auth0/auth0-react';
import { useContext, useEffect } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { userLoginSucceeded } from '../../store/slices/auth';

export const Home = (): JSX.Element => {
    const { siteDescription, siteHomeImageUrl } = useContext(ConfigurableContentContext);

    const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (isAuthenticated) {
            getAccessTokenSilently().then((token) => {
                dispatch(
                    userLoginSucceeded({
                        userId: user?.sub,
                        token,
                    })
                );
            });
        }
    });

    return (
        <div>
            <img className="home-image" src={siteHomeImageUrl} alt="Home" /> {siteDescription}
        </div>
    );
};
