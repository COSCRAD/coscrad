import { IValueAndDisplay } from '@coscrad/api-interfaces';
import { Typography } from '@mui/material';
import { Box } from '@mui/system';

/**
 * Provides a standard presentation for a single property on a view model
 *
 * TODO: Consider an optional property helper - would it work at this level?
 */
export const SinglePropertyPresenter = <T,>({
    value,
    display,
}: IValueAndDisplay<T>): JSX.Element => (
    <Box sx={{ mb: 1 }}>
        <>
            <Typography component={'span'} sx={{ fontWeight: 'bold' }}>
                {display}:
            </Typography>
            &nbsp;
            <Typography component={'span'}>{value as string}</Typography>
        </>
    </Box>
);
