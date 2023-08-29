import styled from '@emotion/styled';
import { ReactNode } from 'react';

interface FadeInOutContentProps {
    children: ReactNode;
}

const AnimatedContent = styled('span')({
    '@keyframes fade': {
        '0%,100%': { opacity: 0 },
        '50%': { opacity: 1 },
    },
    animation: 'fade 1s linear',
    opacity: '0',
});

export const FadeInOutContent = ({ children }: FadeInOutContentProps): JSX.Element => {
    return <AnimatedContent>{children}</AnimatedContent>;
};
