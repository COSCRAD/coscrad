import { Box, Container } from '@mui/material';
import { ReactNode } from 'react';
import { FloatSpacerDiv } from '../utils/generic-components';

interface CoscradStyleContainerProps {
    children: ReactNode;
}

export const CoscradLayoutContainer = ({ children }: CoscradStyleContainerProps): JSX.Element => (
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '80vh',
        }}
    >
        <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="md">
            {children}
            <FloatSpacerDiv />
        </Container>
    </Box>
);
