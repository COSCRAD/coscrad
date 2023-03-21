import { Container } from '@mui/material';
import { ReactNode } from 'react';
import { FloatSpacerDiv } from '../float-spacer';

interface CoscradMainContentContainerProps {
    children: ReactNode;
}

export const CoscradPrimaryStyleLayoutContainer = ({
    children,
}: CoscradMainContentContainerProps): JSX.Element => {
    return (
        <Container
            component="div"
            sx={{ paddingTop: '5%', width: { xs: '90%', sm: '80%' }, margin: 'auto' }}
        >
            {children}
            <FloatSpacerDiv />
        </Container>
    );
};
