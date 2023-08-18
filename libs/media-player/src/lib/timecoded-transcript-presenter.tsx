import { ITranscript } from '@coscrad/api-interfaces';
import { Box } from '@mui/material';
import { MediaCurrentTimeFormatted } from './timecode-formatted';

export type MediaCurrentTimeFormated = `${number | ''}${number}:${number}${number}`;

interface TimecodedTranscriptPresenterProps {
    transcript: ITranscript;
    mediaCurrentTime: number;
}

export const TimecodedTranscriptPresenter = ({
    transcript,
    mediaCurrentTime,
}: TimecodedTranscriptPresenterProps) => {
    const { items: transcriptLines } = transcript;

    return (
        <Box>
            Time Code: <MediaCurrentTimeFormatted mediaCurrentTime={mediaCurrentTime} />
            Transcript Line:{' '}
            <TranscriptLinePresenter
                mediaCurrentTime={mediaCurrentTime}
                transcriptLines={transcriptLines}
            />
        </Box>
    );
};
