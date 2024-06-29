import { IMultilingualTextItem } from '@coscrad/api-interfaces';
import { isString } from '@coscrad/validation-constraints';
import { Box, Typography } from '@mui/material';

interface DigitalTextPageDetailTextPresenterProps {
    textItem: IMultilingualTextItem | string;
}

export const DigitalTextPageDetailTextPresenter = ({
    textItem,
}: DigitalTextPageDetailTextPresenterProps): JSX.Element => {
    const text = isString(textItem) ? textItem : textItem.text;

    return (
        <Box sx={{ height: '40vh', overflow: 'scroll' }}>
            <Typography
                sx={{
                    padding: '40px',
                    fontFamily: 'Times',
                    fontSize: '1.1em',
                    whiteSpace: 'pre-wrap',
                }}
                variant="body1"
            >
                {text}
            </Typography>
        </Box>
    );
};
