import { Container } from '@mui/material';
import { ReactNode } from 'react';
import { FloatSpacerDiv } from '../float-spacer';

interface CoscradMainContentContainerProps {
    children: ReactNode;
}

export const CoscradMainContentContainer = ({
    children,
}: CoscradMainContentContainerProps): JSX.Element => {
    return (
        <Container
            component="div"
            disableGutters
            sx={{ paddingTop: '5%', width: { xs: '90%', md: '80%' }, margin: 'auto' }}
        >
            {children}
            <FloatSpacerDiv />
        </Container>
    );
};
