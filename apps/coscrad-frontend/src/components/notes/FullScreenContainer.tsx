import { Button } from '@mui/material';
import { ReactNode } from 'react';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';

interface FullScreenContainerProps {
    children: ReactNode;
}

export const FullScreenContainer = ({ children }): JSX.Element => {
    const handle = useFullScreenHandle();

    return (
        <>
            <Button sx={{ mb: 1 }} variant="contained" onClick={handle.enter}>
                Enter fullscreen
            </Button>
            <FullScreen handle={handle}>{children}</FullScreen>
        </>
    );
};
