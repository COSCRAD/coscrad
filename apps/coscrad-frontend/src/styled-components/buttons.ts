import { PauseCircleFilledOutlined, PlayCircleFilledOutlined } from '@mui/icons-material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import styled from 'styled-components';
import { defaultColor } from './colors';

export const SkipBackButton = styled(ArrowBackIosIcon)`
    color: ${defaultColor[100]};
    font-size: 48px !important;
    display: inline;
`;

export const SkipForwardButton = styled(ArrowForwardIosIcon)`
    color: ${defaultColor[100]};
    font-size: 48px !important;
    display: inline;
`;

export const PlayButton = styled(PlayCircleFilledOutlined)`
    font-size: 64px !important;
`;

export const PauseButton = styled(PauseCircleFilledOutlined)`
    font-size: 64px !important;
`;
