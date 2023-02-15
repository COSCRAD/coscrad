import styled from '@emotion/styled';
import { AppBar, Toolbar } from '@mui/material';
import { Box } from '@mui/system';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { NavBar } from '../nav-bar/nav-bar';

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
    const { siteTitle, subTitle } = useContext(ConfigurableContentContext);

    return (
        <StyledAppBar>
            <StyledToolbar>
                <StyledSiteTitle>
                    <Link to="/">
                        <h1>{siteTitle}</h1>
                        <h2>{subTitle}</h2>
                    </Link>
                </StyledSiteTitle>
                <NavBar></NavBar>
            </StyledToolbar>
        </StyledAppBar>
    );
};
