import { ITranscriptItem } from '@coscrad/api-interfaces';
import { Box, Typography } from '@mui/material';
import { MultilingualTextItemPresenter } from '../../utils/generic-components/presenters/multilingual-text-item-presenter';

interface TranscriptItemsPresenterProps {
    transcriptItems: ITranscriptItem[];
}

export const TranscriptItemsPresenter = ({
    transcriptItems,
}: TranscriptItemsPresenterProps): JSX.Element => {
    if (transcriptItems.length === 0) return null;

    return (
        <>
            {transcriptItems.map(
                ({ speakerInitials, inPointMilliseconds, outPointMilliseconds, text }) => (
                    <Box key={`${speakerInitials}-${inPointMilliseconds}`}>
                        <Typography component="span" variant="body1" mr={1} fontWeight="bold">
                            {speakerInitials} [{inPointMilliseconds}-{outPointMilliseconds}]:
                        </Typography>
                        {text.items.map(({ text, languageCode, role }) => (
                            <MultilingualTextItemPresenter
                                variant="body1"
                                text={text}
                                languageCode={languageCode}
                                role={role}
                            />
                        ))}
                    </Box>
                )
            )}
        </>
    );
};
