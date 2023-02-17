import styled from '@emotion/styled';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { NavMenu } from '../nav-menu/nav-menu';

const StyledAppBar = styled(AppBar)({
    backgroundColor: '#2cb5af',
    position: 'sticky',
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
    const { siteTitle } = useContext(ConfigurableContentContext);

    return (
        <StyledAppBar>
            <StyledToolbar>
                <StyledSiteTitle>
                    <Link to="/">
                        <Typography variant="h5">{siteTitle}</Typography>
                    </Link>
                </StyledSiteTitle>
                <NavMenu></NavMenu>
            </StyledToolbar>
        </StyledAppBar>
    );
};
