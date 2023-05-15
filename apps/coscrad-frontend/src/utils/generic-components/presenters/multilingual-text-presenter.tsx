import { IMultilingualText } from '@coscrad/api-interfaces';
import { Box, Typography } from '@mui/material';

// TODO use contentConfigContext
// default language code
// find the text iterm with the default language code
// find the text item with english
// note: either of these may not exist (fallback logic)
// build an appropriate presentation of these properties

export interface MultilingualTextPresenterProps {
    text: IMultilingualText;
}

export const MultilingualTextPresenter = ({
    text,
}: MultilingualTextPresenterProps): JSX.Element => {
    const { items } = text;

    if (!Array.isArray(items)) {
        throw new Error(`invalid input to Multlingual text!: ${text}`);
    }

    return (
        <>
            {/* TODO We need to separate the original in some way */}
            {items.map(({ languageCode, text, role }) => (
                <Box key={`${languageCode}-${role}`}>
                    {text}
                    <Typography
                        variant="subtitle1"
                        color={'secondary.dark'}
                    >{`${languageCode}, '${role}'`}</Typography>
                </Box>
            ))}
        </>
    );
};
