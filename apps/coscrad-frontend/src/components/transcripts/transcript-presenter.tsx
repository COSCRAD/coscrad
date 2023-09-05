import { ITranscript } from '@coscrad/api-interfaces';
import { SubtitlesRounded as SubtitlesRoundedIcon } from '@mui/icons-material';
import { Box, Card, CardContent, CardHeader, Divider, Typography } from '@mui/material';
import { TranscriptLinePresenter } from './transcript-line-presenter';

interface TranscriptPresenterProps {
    transcript: ITranscript;
    currentTime: number;
}

export const TranscriptPresenter = ({
    transcript,
    currentTime,
}: TranscriptPresenterProps): JSX.Element => {
    const { participants, items } = transcript;

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
                {participants.map(({ name, initials }) => (
                    <Box key={`${name}-${initials}`}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            Participants:&nbsp;
                        </Typography>
                        {name} ({initials})
                    </Box>
                ))}
                <Divider sx={{ marginY: 2 }} />
                {/**
                 * check "why did I rerender?"
                 * TODO: model timestate in parent as discrete set of intervals and
                 * only re-render when an interval boundary is crossed
                 */}
                {items.map((transcriptLine) => (
                    <TranscriptLinePresenter
                        key={`${transcriptLine.inPointMilliseconds}-${transcriptLine.speakerInitials}`}
                        transcriptLine={transcriptLine}
                        currentTime={currentTime}
                    />
                ))}
            </CardContent>
        </Card>
    );
};
