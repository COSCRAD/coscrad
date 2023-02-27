import { MenuItem } from '@mui/material';
import { Link } from 'react-router-dom';
import { NavItemInfo } from './nav-menu-container';

export interface NavItemItemProps {
    navItemInfo: NavItemInfo;
    handleClose: () => void;
}

export const NavMenuItem = ({ navItemInfo, handleClose }: NavItemItemProps) => {
    const { link, label } = navItemInfo;

    return (
        <MenuItem onClick={handleClose}>
            <Link to={link}>{label}</Link>
        </MenuItem>
    );
};
