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
        <Link to={link}>
            <MenuItem onClick={handleClose}>{label}</MenuItem>
        </Link>
    );
};
