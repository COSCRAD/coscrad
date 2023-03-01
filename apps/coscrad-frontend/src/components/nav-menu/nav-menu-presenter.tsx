import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { IconButton, Menu } from '@mui/material';
import AuthenticationButton from '../authentication-button/authentication-button';
import { NavMenuItem } from './nav-menu-item';

interface NavMenuHandlerContainerProps {
    navItemInfos: any;
    isOpen: any;
    handleClick: any;
    handleClose: any;
    anchorEl: any;
}

export const NavMenuPresenter = ({
    navItemInfos,
    isOpen,
    handleClick,
    handleClose,
    anchorEl,
}: NavMenuHandlerContainerProps): JSX.Element => {
    return (
        <>
            <IconButton
                id="basic-button"
                color="primary"
                sx={{ mr: 2 }}
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
        </>
    );
};
