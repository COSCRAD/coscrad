import { CategorizableType } from '@coscrad/api-interfaces';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { Box, IconButton, Menu } from '@mui/material';
import { useContext, useState } from 'react';
import { routes } from '../../app/routes/routes';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import AuthenticationButton from '../authentication-button/authentication-button';
import { NavMenuItem } from './nav-menu-item';

export type NavItemInfo = {
    link: string;
    label: string;
};

// TODO: We should have a NavBar container and presenter
export const NavMenu = (): JSX.Element => {
    const { indexToDetailFlows } = useContext(ConfigurableContentContext);

    // note this may be [] if we haven't included `notes`
    const dynamicLinks = indexToDetailFlows
        .filter(({ categorizableType }) => categorizableType === CategorizableType.note)
        .map(({ label, route }) => ({
            link: route || routes.notes.index,
            label: label || 'Notes',
        }));

    // We may want an enum \ constants for our routes
    const navItemInfos: NavItemInfo[] = [
        {
            link: routes.home,
            label: 'Home',
        },
        {
            link: routes.about,
            label: 'About',
        },
        {
            link: routes.resources.info,
            label: 'Browse Resources',
        },
        {
            link: routes.tags.index,
            label: 'Tags',
        },
        {
            link: routes.treeOfKnowledge,
            label: 'Tree of Knowledge',
        },
        ...dynamicLinks,
        {
            link: routes.siteCredits,
            label: 'Credits',
        },
    ];

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Box>
            <IconButton
                id="basic-button"
                color="primary"
                sx={{ mr: 2 }}
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
            >
                <MenuRoundedIcon />
            </IconButton>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                {navItemInfos.map((navItemInfo) => (
                    <NavMenuItem
                        key={navItemInfo.label}
                        navItemInfo={navItemInfo}
                        handleClose={handleClose}
                    />
                ))}
            </Menu>
            <AuthenticationButton />
        </Box>
    );
};
