import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { Box, IconButton, Menu } from '@mui/material';
import { useState } from 'react';
import AuthenticationButton from '../authentication-button/authentication-button';
import { NavItemInfo } from './nav-menu-container';
import { NavMenuItem } from './nav-menu-item';

interface NavMenuPresenterProps {
    navItemInfos: NavItemInfo[];
}

export const NavMenuPresenter = ({ navItemInfos }: NavMenuPresenterProps): JSX.Element => {
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
