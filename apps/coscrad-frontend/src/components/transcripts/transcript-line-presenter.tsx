import { ITranscriptItem } from '@coscrad/api-interfaces';
import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

enum FontColor {
    black = 'black',
    red = 'red',
}

interface TranscriptLinePresenterProps {
    transcriptLine: ITranscriptItem;
    currentTime: number;
}

export const TranscriptLinePresenter = ({
    transcriptLine,
    currentTime,
}: TranscriptLinePresenterProps) => {
    const [fontColor, setFontColor] = useState(FontColor.black);

    const { inPointMilliseconds, outPointMilliseconds, speakerInitials, text } = transcriptLine;

    const { items: textItems } = text;

    useEffect(() => {
        if (currentTime >= inPointMilliseconds && currentTime <= outPointMilliseconds) {
            setFontColor(FontColor.red);
        }
    }, [currentTime]);

    return (
        <Box display={'flex'} sx={{ color: fontColor }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {speakerInitials} [{inPointMilliseconds}-{outPointMilliseconds}
                ]:&nbsp;
            </Typography>
            <Typography variant="body1">
                {textItems.map(({ text, languageCode }) => (
                    <Box key={languageCode} component={'span'}>
                        "{text}"
                    </Box>
                ))}
            </Typography>
        </Box>
    );
};
