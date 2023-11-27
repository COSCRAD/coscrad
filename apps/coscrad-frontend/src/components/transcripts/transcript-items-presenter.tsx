import { ITranscriptItem } from '@coscrad/api-interfaces';
import { Box, Typography } from '@mui/material';

interface TranscriptItemsPresenterProps {
    transcriptItems: ITranscriptItem[];
}

export const TranscriptItemsPresenter = ({
    transcriptItems,
}: TranscriptItemsPresenterProps): JSX.Element => {
    return (
        <>
            {transcriptItems.map(
                ({ speakerInitials, inPointMilliseconds, outPointMilliseconds, text }) => (
                    <Typography variant="body1" key={`${speakerInitials}-${inPointMilliseconds}`}>
                        <Box component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
                            {speakerInitials} [{inPointMilliseconds}-{outPointMilliseconds}]:
                        </Box>
                        {/* TODO: sort out how multilingual text should work here */}
                        {text.items.map(({ text, role }) => (
                            <Box key={role} component={'span'}>
                                "{text}"
                            </Box>
                        ))}
                    </Typography>
                )
            )}
        </>
    );
};
