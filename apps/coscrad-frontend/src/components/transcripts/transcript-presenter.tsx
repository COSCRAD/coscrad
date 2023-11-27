import { ITranscript } from '@coscrad/api-interfaces';
import { SubtitlesRounded as SubtitlesRoundedIcon } from '@mui/icons-material';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import { ParticipantsPresenter } from './participants-presenter';
import { TranscriptItemsPresenter } from './transcript-items-presenter';

interface TranscriptPresenterProps {
    transcript: ITranscript;
}

export const TranscriptPresenter = ({
    transcript: { participants, items: transcriptItems },
}: TranscriptPresenterProps): JSX.Element => {
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
                {participants.length > 0 ? (
                    <ParticipantsPresenter participants={participants} />
                ) : (
                    <Typography variant="body1" color="info.main">
                        A Transcript has been added but no participants have been added to the
                        transcript yet.
                    </Typography>
                )}

                {transcriptItems.length > 0 ? (
                    <TranscriptItemsPresenter transcriptItems={transcriptItems} />
                ) : null}
            </CardContent>
        </Card>
    );
};
