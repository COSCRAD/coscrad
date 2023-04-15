import { IValueAndDisplay } from '@coscrad/api-interfaces';
import { Grid } from '@mui/material';

/**
 * Provides a standard presentation for a single property on a view model
 */
export const SinglePropertyPresenter = <T,>({
    value,
    display,
}: IValueAndDisplay<T>): JSX.Element => (
    <Grid component="span" container spacing={1} sx={{ mb: 1 }}>
        <Grid item sx={{ fontWeight: 'bold' }}>
            {display}:
        </Grid>
        <Grid item>{value as string}</Grid>
    </Grid>
);
