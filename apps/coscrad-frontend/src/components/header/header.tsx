import styled from '@emotion/styled';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { NavMenuContainer } from '../nav-menu/nav-menu-container';

const AppBarWithTestIdDataAttribute = ({ children }) => <AppBar data-testid={'app-bar'}>{children}</AppBar>;

const StyledAppBar = styled(AppBarWithTestIdDataAttribute)({
    backgroundColor: 'primary.main',
    position: 'sticky',
    padding: '.5em',
});

const StyledToolbar = styled(Toolbar)({
    display: 'flex',
    justifyContent: 'space-between',
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
    const { siteTitle } = useContext(ConfigurableContentContext);

    return (
        <StyledAppBar data-testid={'header'}>
            <StyledToolbar>
                <StyledSiteTitle>
                    <Link to="/">
                        <Typography variant="h1">{siteTitle}</Typography>
                    </Link>
                </StyledSiteTitle>
                <NavMenuContainer />
            </StyledToolbar>
        </StyledAppBar>
    );
};
