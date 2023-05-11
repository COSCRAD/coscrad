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
        <Container disableGutters maxWidth={false} component="div" sx={{ mt: '64px' }}>
            <Container
                component="div"
                disableGutters
                sx={{
                    paddingTop: '5%',
                    width: { xs: '90%', md: '80%' },
                    margin: 'auto',
                }}
            >
                {children}
                <FloatSpacerDiv />
            </Container>
        </Container>
    </Box>
);
