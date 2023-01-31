import styled from '@emotion/styled';
import { Card } from '@mui/material';
import { primaryColor as primary } from './colors';

export const PrimaryCard = styled(Card)`
    background: ${primary[100]};
`;

export default PrimaryCard;
