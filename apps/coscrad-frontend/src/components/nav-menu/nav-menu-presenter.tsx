import { isNull } from '@coscrad/validation-constraints';
import { Box } from '@mui/material';
import { useState } from 'react';
import AuthenticationButton from '../authentication-button/authentication-button';
import { NavItemInfo } from './nav-menu-container';
import { NavMenuItem } from './nav-menu-item';

interface NavMenuPresenterProps {
    navItemInfos: NavItemInfo[];
}

export const NavMenuPresenter = ({ navItemInfos }: NavMenuPresenterProps): JSX.Element => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const isOpen = !isNull(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        console.log('hi');
        // setAnchorEl(null);
    };

    return (
        <div data-testid="nav-menu">
            <Box sx={{ minWidth: '100px' }}>
                <IconButton
                    id="basic-button"
                    color="primary"
                    aria-controls={isOpen ? 'basic-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={isOpen ? 'true' : undefined}
                    onClick={handleClick}
                >
                    <MenuRoundedIcon />
                </IconButton>
                <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={isOpen}
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
        </div>
    );
};
