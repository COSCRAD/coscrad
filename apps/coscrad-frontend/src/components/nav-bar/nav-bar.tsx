import { CategorizableType } from '@coscrad/api-interfaces';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { Box, IconButton, Menu, MenuItem, styled } from '@mui/material';
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { routes } from '../../app/routes/routes';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import AuthenticationButton from '../authentication-button/authentication-button';

export type NavItemInfo = {
    link: string;
    label: string;
};

// TODO: We should have a NavBar container and presenter
export const NavBar = (): JSX.Element => {
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
        {
            link: routes.siteCredits,
            label: 'Credits',
        },
        ...dynamicLinks,
    ];

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        console.log(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const StyledBox = styled(Box)({
        display: 'flex',
        justifyContent: 'space-between',
        width: '138px',
    });

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
                {navItemInfos.map(({ link, label }, index) => (
                    <MenuItem onClick={handleClose} key={index}>
                        <Link to={link}>{label}</Link>
                    </MenuItem>
                ))}
            </Menu>
            <AuthenticationButton />
        </Box>
    );
};
