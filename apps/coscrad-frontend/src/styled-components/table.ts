import { FormControl, Paper } from '@mui/material';
import styled from 'styled-components';
import { defaultColor, primaryColor, teritaryColor, typographyPrimaryColor } from './colors';

export const TableStyled = styled.div`
    width: 100%;
    border-collapse: seperate;

    .wrapper {
        overflow: auto;
        border-radius: 12px 12px 0 0;
    }

    table {
        width: 100%;
        border-spacing: 0;
        border-collapse: collapse;
        border-style: hidden;
        max-width: 100%;
    }

    th {
        margin-top: 16px !important;
        padding-top: 16px !important;
        padding-bottom: 16px !important;
        text-align: left;
        background-color: ${teritaryColor[100]};
        color: ${defaultColor[100]};
        font-weight: bold;
    }
    td {
        color: ${typographyPrimaryColor[100]}!important;
    }

    th,
    td {
        border: 1.75px solid ${primaryColor[100]};
        border-left: none;
        border-right: none;
        padding: 10px;
    }

    tr:hover {
        background-color: ${primaryColor[100]};
    }

    tr {
        background-color: ${defaultColor[100]};
    }
`;

export const TableFooter = styled(Paper)`
    background: ${teritaryColor[100]} !important;
    color: ${defaultColor[100]}!important;
    border-radius: 0 0 12px 12px !important;
    border-top: 2px solid ${primaryColor[100]};
`;

export const TableSelect = styled(FormControl)`
    * {
        color: ${defaultColor[100]} !important;
        border-color: ${primaryColor[100]} !important;
    }
`;
