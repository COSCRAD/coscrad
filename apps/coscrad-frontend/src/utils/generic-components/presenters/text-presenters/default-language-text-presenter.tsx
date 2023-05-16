import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { Box, Typography } from '@mui/material';

interface DefaultLanguageTextPresenterProps {
    languageCode: LanguageCode;
    text: string;
    role: MultilingualTextItemRole;
}

export const DefaultLanguageTextPresenter = ({
    languageCode,
    text,
    role,
}: DefaultLanguageTextPresenterProps): JSX.Element => {
    return (
        <Box key={`${languageCode}-${role}`}>
            {text}
            <Typography variant="subtitle1" color={'secondary.dark'}>
                {`${languageCode}, '${role}'`}
            </Typography>
        </Box>
    );
};
