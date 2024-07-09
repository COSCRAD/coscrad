import { AppBar, Avatar, Container, Toolbar, Typography } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { AuthenticationButton } from '../authentication-button/authentication-button';
import { NavMenuContainer } from '../nav-menu/nav-menu-container';

export const Header = (): JSX.Element => {
    /**
     * TODO: Move data (ConfigurableContentContext) out of presenter
     */
    const { siteTitle } = useContext(ConfigurableContentContext);
    const { organizationLogoUrl } = useContext(ConfigurableContentContext);

    return (
        <AppBar position="fixed" sx={{ zIndex: 500 }} data-testid={'header'}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Avatar src={organizationLogoUrl} alt={siteTitle} sx={{ mr: 1 }} />
                    <Typography
                        sx={{
                            fontSize: 'calc(16px + 0.7vw) !important',
                            flexGrow: 1,
                            color: '#fff',
                        }}
                        variant="h1"
                        component="a"
                        href="/"
                    >
                        {siteTitle}
                    </Typography>
                    <NavMenuContainer />
                    <AuthenticationButton />
                </Toolbar>
            </Container>
        </AppBar>
    );
};
