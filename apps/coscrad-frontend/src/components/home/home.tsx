import { useAuth0 } from '@auth0/auth0-react';
import { Typography } from '@mui/material';
import { useContext, useEffect } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { userLoginSucceeded } from '../../store/slices/auth';
import { ImageInContent } from '../../utils/generic-components/presenters/image-in-content';
import { CoscradPrimaryStyleLayoutContainer } from '../../utils/generic-components/style-components/coscrad-main-content-container';

export const Home = (): JSX.Element => {
    /**
     * TODO: Move data (ConfigurableContentContext, auth, and dispatch) out of presenter
     */
    const { siteDescription, siteHomeImageUrl } = useContext(ConfigurableContentContext);

    const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();

    const dispatch = useAppDispatch();

    // Simulating image object retrieved from Digital Asset Manager
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
        <CoscradPrimaryStyleLayoutContainer>
            {/**
             * TODO: consider using a photograph detail presenter for this
             */}

            <ImageInContent image={image} alignment="left" displayWidth="45%" />
            <Typography variant="body1">{siteDescription}</Typography>
        </CoscradPrimaryStyleLayoutContainer>
    );
};
