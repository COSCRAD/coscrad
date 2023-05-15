import styled from '@emotion/styled';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { StyledImage } from '../../utils/generic-components/presenters/styled-image';
import { NavMenuContainer } from '../nav-menu/nav-menu-container';

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
    const { siteTitle } = useContext(ConfigurableContentContext);
    const { organizationLogoUrl } = useContext(ConfigurableContentContext);

    return (
        <StyledAppBar data-testid={'header'}>
            <StyledToolbar>
                <Link to="/">
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'Background' }}>
                        <StyledSiteTitle
                            sx={{ marginRight: '20px', display: 'flex', alignItems: 'center' }}
                        >
                            <StyledImage
                                sx={{ width: '30px' }}
                                src={organizationLogoUrl}
                                alt={siteTitle}
                            />
                        </StyledSiteTitle>
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
                <NavMenuContainer />
            </StyledToolbar>
        </StyledAppBar>
    );
};
