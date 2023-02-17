import { MenuItem } from '@mui/material';
import { Link } from 'react-router-dom';
import { NavItemInfo } from './nav-menu';

export interface NavItemItemProps {
    index: number;
    navItemInfo: NavItemInfo;
    handleClose: () => void;
}

export const NavMenuItem = ({ index, navItemInfo, handleClose }: NavItemItemProps) => {
    const { link, label } = navItemInfo;

    return (
        <MenuItem onClick={handleClose} key={index}>
            <Link to={link}>{label}</Link>
        </MenuItem>
    );
};
