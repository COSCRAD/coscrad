import { IValueAndDisplay } from '@coscrad/api-interfaces';
import { Grid } from '@mui/material';
import { truncateText } from '../../string-processor/shorten-string';

const MAXIMUM_NUMBER_OF_CHARACTERS = 170;

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
            {truncateText(value as string, MAXIMUM_NUMBER_OF_CHARACTERS)}
        </Grid>
    </Grid>
);
