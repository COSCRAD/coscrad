import { Card, Divider, Typography } from '@mui/material';
import styled from 'styled-components';
import { defaultColor, primaryColor, secondaryColor } from './colors';

export const PrimaryCard = styled(Card)`
    color: ${secondaryColor[100]} !important;
    background: ${defaultColor[100]} !important;
    border-radius: 10px;
    margin: auto;
    width: 88%;
    border-radius: 10px !important;
    box-shadow: 0 10px 10px -5px rgba(0, 0, 0, 0.2);
    box-shadow: 0 10px 10px -5px rgba(0, 0, 0, 0.2) !important;
`;

export const DetailCard = styled(Card)`
background: ${defaultColor[100]} !important;
border-radius: 10px !important;
box-shadow: 0 10px 10px -5px rgba(0, 0, 0, 0.2) !important;
#detail-term {
    background: linear-gradient(to right, ${primaryColor[100]}, ${secondaryColor[100]}) !important;
    -webkit-background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
}
}
`;

export const BodyCard = styled(Typography)`
    background: linear-gradient(to bottom, ${primaryColor[100]} 10%, ${secondaryColor[100]}90%);
`;

export const VocabularyListWrapper = styled(Card)`
    background: none !important;
    box-shadow: none !important;
`;

export const DividerStyle = styled(Divider)`
    margin-bottom: 12px !important;
`;
