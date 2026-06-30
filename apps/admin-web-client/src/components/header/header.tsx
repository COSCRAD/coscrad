import styled from '@emotion/styled';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { Link } from 'react-router-dom';
import { NavMenuPresenter } from '../nav-menu/nav-menu-presenter';

const AppBarWithTestIdDataAttribute = ({ children }) => (
    <AppBar data-testid={'app-bar'}>{children}</AppBar>
);

const StyledAppBar = styled(AppBarWithTestIdDataAttribute)({
    backgroundColor: 'primary.main',
    position: 'sticky',
    padding: '.5em',
});

const StyledToolbar = styled(Toolbar)({
    display: 'flex',
    justifyContent: 'space-between',
    height: '64px',
});

const StyledSiteTitle = styled(Box)`
    a {
        color: #fff;
    }
`;

export const Header = (): JSX.Element => {
    /**
     * TODO: Move data (ConfigurableContentContext) out of presenter
     */
    const siteTitle = 'Language Hub Prototype';

    return (
        <StyledAppBar data-testid={'header'}>
            <StyledToolbar>
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'Background' }}>
                        <StyledSiteTitle
                            sx={{ marginRight: '20px', display: 'flex', alignItems: 'center' }}
                        ></StyledSiteTitle>
                        <StyledSiteTitle>
                            <Typography
                                sx={{ fontSize: 'calc(16px + 0.7vw) !important' }}
                                variant="h1"
                            >
                                {siteTitle}
                            </Typography>
                        </StyledSiteTitle>
                    </Box>
                </Link>
                <nav>
                    <Typography variant="body1" sx={{ textDecoration: 'none' }}>
                        <Link to="/" style={{ textDecoration: 'none' }}>
                            Home
                        </Link>
                        &nbsp;|&nbsp;
                        <Link to="/terms" style={{ textDecoration: 'none' }}>
                            Terms
                        </Link>
                    </Typography>
                </nav>
                <NavMenuPresenter />
            </StyledToolbar>
        </StyledAppBar>
    );
};
