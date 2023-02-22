import { Box, Container } from '@mui/material';
import { ReactNode } from 'react';

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
        </Container>
    </Box>
);
