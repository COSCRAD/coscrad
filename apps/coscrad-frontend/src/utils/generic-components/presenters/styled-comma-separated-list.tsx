import { styled } from '@mui/material';
import { ReactNode } from 'react';

const StyledCommaSeparatedList = styled('span')({
    '&>*:not(:last-of-type)::after': { content: "', '" },
});

interface CommaSeparatedListProps {
    children: ReactNode;
}

export const CommaSeparatedList = ({ children }: CommaSeparatedListProps): JSX.Element => {
    return <StyledCommaSeparatedList>{children}</StyledCommaSeparatedList>;
};
