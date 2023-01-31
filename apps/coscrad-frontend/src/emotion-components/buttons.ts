import styled from '@emotion/styled';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { primaryColor, secondaryColor } from './colors';

export const BackArrowIcon = styled(ArrowBackIosIcon)`
    color: ${primaryColor[100]};
`;

export const ForwardArrowIcon = styled(ArrowForwardIosIcon)`
    color: ${secondaryColor[100]};
`;
