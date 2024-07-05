import { useAuth0 } from '@auth0/auth0-react';
import { AccountCircle as AccountCircleIcon } from '@mui/icons-material/';
import { Box, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { useState } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { userLoggedOut } from '../../store/slices/auth';
import { CurrentUserInfo } from './current-user-info';

const AccountMenu = () => {
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorElUser);

    const { logout } = useAuth0();

    const dispatch = useAppDispatch();

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleLogout = () => {
        dispatch(userLoggedOut());

        handleCloseUserMenu();

        return logout({
            returnTo: window.location.origin,
        });
    };

    return (
        <>
            <Tooltip title="Account Menu">
                <IconButton data-testid="account-menu" onClick={handleOpenUserMenu}>
                    <AccountCircleIcon sx={{ color: 'white' }} />
                </IconButton>
            </Tooltip>
            <Menu
                id="basic-menu"
                anchorEl={anchorElUser}
                open={open}
                onClose={handleCloseUserMenu}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                <Box sx={{ padding: '12px' }}>
                    <CurrentUserInfo />
                </Box>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
        </>
    );
};

export default AccountMenu;
