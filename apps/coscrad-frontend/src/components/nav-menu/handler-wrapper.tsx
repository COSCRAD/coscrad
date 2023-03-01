import { isNull } from '@coscrad/validation-constraints';
import { Container } from '@mui/material';
import { ReactNode, useState } from 'react';

interface PresenterHandlerContainerProps {
    children: ReactNode;
}

export const PresenterHandlerContainer = ({
    children,
}: PresenterHandlerContainerProps): JSX.Element => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const isOpen = !isNull(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return <Container>{children}</Container>;
};
