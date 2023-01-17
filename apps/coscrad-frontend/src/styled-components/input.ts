import { TextField } from '@mui/material';
import styled from 'styled-components';
import { defaultColor } from './colors';

export const SearchInput = styled(TextField)`
    && {
        background: ${defaultColor[100]};
        height: auto;
        border-radius: 4px;
        margin: 0 0 14px 0;
    }
`;
