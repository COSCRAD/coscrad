import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { Box, Drawer, IconButton, Tooltip } from '@mui/material';
import { useState } from 'react';
import AuthenticationButton from '../authentication-button/authentication-button';
import { CurrentUserInfo } from '../logout-button/current-user-info';
import { NavItemInfo } from './nav-menu-container';
import { NavMenuItem } from './nav-menu-item';

interface NavMenuPresenterProps {
    navItemInfos: NavItemInfo[];
}

export const NavMenuPresenter = ({ navItemInfos }: NavMenuPresenterProps): JSX.Element => {
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = () => {
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <Box columnGap={1} sx={{ display: 'flex', alignItems: 'center' }}>
            <CurrentUserInfo />
            <Tooltip title="Menu">
                <IconButton
                    data-testid="nav-menu-icon"
                    id="basic-button"
                    color="secondary"
                    aria-controls={isOpen ? 'basic-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={isOpen ? 'true' : undefined}
                    onClick={handleClick}
                >
                    <MenuRoundedIcon sx={{ color: 'white' }} />
                </IconButton>
            </Tooltip>
            <AuthenticationButton />
            <Box>
                <Drawer anchor="right" open={isOpen} onClose={handleClose}>
                    <Box sx={{ padding: 3 }}>
                        <IconButton color="primary" onClick={handleClose}>
                            <ChevronRightIcon style={{ fontSize: '2rem' }} />
                        </IconButton>
                        {navItemInfos.map((navItemInfo) => (
                            <NavMenuItem
                                key={navItemInfo.label}
                                navItemInfo={navItemInfo}
                                handleClose={handleClose}
                            />
                        ))}
                    </Box>
                </Drawer>
            </Box>
        </Box>
    );
};
