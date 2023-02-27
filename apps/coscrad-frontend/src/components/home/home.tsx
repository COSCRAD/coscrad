import { useAuth0 } from '@auth0/auth0-react';
import { Typography } from '@mui/material';
import { useContext, useEffect } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { userLoginSucceeded } from '../../store/slices/auth';
import { ImageInContent } from '../image-in-content/image-in-content';

export const Home = (): JSX.Element => {
    /**
     * TODO: Move data (ConfigurableContentContext, auth, and dispatch) out of presenter
     */
    const { siteDescription, siteHomeImageUrl } = useContext(ConfigurableContentContext);

    const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();

    const dispatch = useAppDispatch();

    const image = {
        src: siteHomeImageUrl,
        width: 2000,
        height: 1329,
        title: 'Haida play Singii Ganguu',
    };

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
        <>
            <div>
                {/**
                 * TODO: consider using a photograph detail presenter for this
                 */}

                <ImageInContent image={image} alignment="left" displayWidth="350px" />
                <Typography variant="body1">{siteDescription}</Typography>
            </div>
        </>
    );
};
