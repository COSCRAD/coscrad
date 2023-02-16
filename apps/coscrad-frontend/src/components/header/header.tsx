import styled from '@emotion/styled';
import { AppBar, Toolbar, Typography } from '@mui/material';
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

// header h1 {
//     margin-bottom: 3px;
// }

// header h2 {
//     font-size: medium;
//     margin-top: 0px;
//     margin-left: 7px;
// }

export const Header = (): JSX.Element => {
    const { siteTitle, subTitle } = useContext(ConfigurableContentContext);

    return (
        <StyledAppBar>
            <StyledToolbar>
                <StyledSiteTitle>
                    <Link to="/">
                        <Typography variant="h6">{siteTitle}</Typography>
                    </Link>
                </StyledSiteTitle>
                <NavBar></NavBar>
            </StyledToolbar>
        </StyledAppBar>
    );
};
