import { useAuth0 } from '@auth0/auth0-react';
import { Box, styled } from '@mui/material';
import { useContext, useEffect } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { userLoginSucceeded } from '../../store/slices/auth';
import { ImageInContent } from '../image-in-content/image-in-content';

interface HomeImageProps {
    src: string;
}

const HomeImage = ({ src }: HomeImageProps) => (
    <Box component="img" title="Singii Ganguu Haida Play" src={src} />
);

const StyledHomeImage = styled(HomeImage)({
    width: '200px',
    height: 'auto',
});

export const Home = (): JSX.Element => {
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
                <ImageInContent image={image} alignment="left" />
                {/* <img className="home-image" src={siteHomeImageUrl} alt="Home" /> {siteDescription} */}
            </div>
        </>
    );
};
