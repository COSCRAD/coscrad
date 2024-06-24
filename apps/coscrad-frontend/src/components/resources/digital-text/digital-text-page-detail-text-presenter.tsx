import { IMultilingualTextItem } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, Typography } from '@mui/material';

interface DigitalTextPageDetailTextPresenterProps {
    textItem: IMultilingualTextItem | null;
}

export const DigitalTextPageDetailTextPresenter = ({
    textItem,
}: DigitalTextPageDetailTextPresenterProps): JSX.Element => {
    if (isNullOrUndefined(textItem)) return null;

    const { text } = textItem;

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
