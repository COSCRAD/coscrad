import styled from '@emotion/styled';
import { createTheme } from '@mui/material';
import { primaryColor, secondaryColor } from './colors';

export const theme = createTheme({
    palette: {
        primary: {
            main: primaryColor[100],
        },
        secondary: {
            main: secondaryColor[100],
        },
    },
});

export const TestTest = styled;

export default theme;
