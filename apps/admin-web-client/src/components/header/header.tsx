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

export const Header = (): JSX.Element => {
    /**
     * TODO: Move data (ConfigurableContentContext) out of presenter
     */
    const siteTitle = 'Language Hub Prototype';

    return (
        <StyledAppBar data-testid={'header'}>
            <StyledToolbar>
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'Background', pl: 2 }}>
                        <Typography
                            sx={{ fontSize: 'calc(16px + 0.7vw) !important', color: '#aefff4ff' }}
                            variant="h1"
                        >
                            {siteTitle}
                        </Typography>
                    </Box>
                </Link>
                <nav>
                    <Typography variant="body1">
                        <Link to="/" style={{ textDecoration: 'none', color: '#aefff4ff' }}>
                            Home
                        </Link>
                        &nbsp;|&nbsp;
                        <Link to="/terms" style={{ textDecoration: 'none', color: '#aefff4ff' }}>
                            Terms
                        </Link>
                        &nbsp;|&nbsp;
                        <Link
                            to="/vocabularyLists"
                            style={{ textDecoration: 'none', color: '#aefff4ff' }}
                        >
                            Vocabulary Lists
                        </Link>
                        &nbsp;|&nbsp;
                        <Link
                            to="/contributors"
                            style={{ textDecoration: 'none', color: '#aefff4ff' }}
                        >
                            Contributors
                        </Link>
                    </Typography>
                </nav>
                <NavMenuPresenter />
            </StyledToolbar>
        </StyledAppBar>
    );
};
