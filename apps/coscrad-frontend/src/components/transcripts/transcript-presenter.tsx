import { ITranscript } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { SubtitlesRounded as SubtitlesRoundedIcon } from '@mui/icons-material';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import { ParticipantsPresenter } from './participants-presenter';
import { TranscriptItemsPresenter } from './transcript-items-presenter';

interface TranscriptPresenterProps {
    transcript: ITranscript;
}

export const TranscriptPresenter = ({ transcript }: TranscriptPresenterProps): JSX.Element => {
    if (isNullOrUndefined(transcript)) {
        return null;
    }

    const { participants, items: transcriptItems } = transcript;

    // Transcription is still in progress
    if (participants.length === 0) return null;

    // We know at this point that we have at least one participant

    return (
        <Card elevation={0}>
            <CardHeader
                avatar={<SubtitlesRoundedIcon color="primary" />}
                title={
                    <Typography variant="h4" margin={'auto 0'}>
                        Transcript
                    </Typography>
                }
            />
            <CardContent>
                <ParticipantsPresenter participants={participants} />
                <TranscriptItemsPresenter transcriptItems={transcriptItems} />
            </CardContent>
        </Card>
    );
};
