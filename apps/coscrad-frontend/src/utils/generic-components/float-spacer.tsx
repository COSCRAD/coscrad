import { styled } from '@mui/material';

const StyledDiv = styled('div')({
    clear: 'both',
});

export const FloatSpacerDiv = (): JSX.Element => <StyledDiv>&nbsp;</StyledDiv>;
