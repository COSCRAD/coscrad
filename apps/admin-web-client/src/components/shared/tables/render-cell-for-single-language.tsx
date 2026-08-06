import { IMultilingualTextItem } from '@coscrad/api-interfaces';
import { Typography } from '@mui/material';

export const renderMultilingualTextItem = (textItem: IMultilingualTextItem) => (
    // TODO Add language tooltip
    <Typography variant="body1">{textItem.text}</Typography>
);
