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
        {/**
         * NOTE: the `xs` here is a bizarre workaround to get MUI Grid to adhere to
         * CSS flexbox properly when wrapping long text (e.g., the abstract)
         * [https://github.com/mui/material-ui/issues/11339#issuecomment-388542106]
         */}
        <Grid item xs>
            {value as string}
        </Grid>
    </Grid>
);
