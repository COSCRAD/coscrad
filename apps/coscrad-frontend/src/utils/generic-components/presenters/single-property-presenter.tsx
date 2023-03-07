import { IValueAndDisplay } from '@coscrad/api-interfaces';
import { Typography } from '@mui/material';
import { Box } from '@mui/system';

/**
 * Provides a standard presentation for a single property on a view model
 *
 * TODO: Consider a separate utility to add the break tags using reduce
 */
export const SinglePropertyPresenter = <T,>({
    value,
    display,
}: IValueAndDisplay<T>): JSX.Element => (
    <Box sx={{ mb: 1 }}>
        <>
            <Typography component={'span'} sx={{ fontWeight: 'bold' }}>
                {display}:
            </Typography>{' '}
            {value}
        </>
    </Box>
);
