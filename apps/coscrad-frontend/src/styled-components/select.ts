import { FormControl } from '@mui/material';
import styled from 'styled-components';
import { defaultColor, typographyPrimaryColor } from './colors';

export const FormControlStyled = styled(FormControl)`
    color: ${typographyPrimaryColor[100]} !important;
    background: ${defaultColor[100]} !important;
    margin: 1 !important;
    min-width: 120px !important;
    text-transform: capitalize !important;
    border-radius: 4px !important;
    margin: 4px !important;
`;
