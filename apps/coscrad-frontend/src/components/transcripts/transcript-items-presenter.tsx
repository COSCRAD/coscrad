import { ITranscriptItem } from '@coscrad/api-interfaces';
import { Box, Typography } from '@mui/material';

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
                    <Box key={`${speakerInitials}-${inPointMilliseconds}`} mb={1}>
                        <Typography component="span" variant="body1" mr={1} fontWeight="bold">
                            {speakerInitials} [{inPointMilliseconds}-{outPointMilliseconds}]:
                        </Typography>
                        {/**
                         * TODO: sort out language version presentation
                         * - should we use the multilingual presenter and pass in
                         *  a `variant` so that it displays inline?
                         * - would the user toggle the transcript language at the top
                         *  level so that the entire transcript be displayed in each language?
                         * - should we build another multilingual text presenter for this
                         *  inline use case?  How would we do it without an accordion?
                         */}

                        {text.items.map(({ text, languageCode, role }) => (
                            <Box component="span" key={role} mr={1}>
                                "{text} ({languageCode})"
                            </Box>
                        ))}
                    </Box>
                )
            )}
        </>
    );
};
