import { isNull } from '@coscrad/validation-constraints';
import { Box } from '@mui/material';
import { useState } from 'react';
import { NavItemInfo } from './nav-menu-container';
import { NavMenuPresenter } from './nav-menu-presenter';

interface NavMenuPresenterProps {
    navItemInfos: NavItemInfo[];
}

export const NavMenuHandlerContainer = ({ navItemInfos }: NavMenuPresenterProps): JSX.Element => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const isOpen = !isNull(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Box>
            <NavMenuPresenter
                navItemInfos={navItemInfos}
                isOpen={isOpen}
                handleClick={handleClick}
                handleClose={handleClose}
                anchorEl={anchorEl}
            />
        </Box>
    );
};
