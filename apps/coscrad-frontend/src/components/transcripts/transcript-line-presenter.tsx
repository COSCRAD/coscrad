import { ITranscriptItem } from '@coscrad/api-interfaces';
import { Box, Typography } from '@mui/material';
import { useMemo } from 'react';

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
    // const [fontColor, setFontColor] = useState(FontColor.black);

    const { inPointMilliseconds, outPointMilliseconds, speakerInitials, text } = transcriptLine;

    const { items: textItems } = text;

    // useEffect(() => {
    //     console.log(
    //         `${currentTime} >= ${inPointMilliseconds} && ${currentTime} <= ${outPointMilliseconds}`
    //     );

    //     if (currentTime >= inPointMilliseconds && currentTime <= outPointMilliseconds) {
    //         setFontColor(FontColor.red);
    //         console.log({ fontColor });
    //     }
    // }, [currentTime, fontColor, inPointMilliseconds, outPointMilliseconds]);

    const fontColor = useMemo(() => {
        console.log(
            `${currentTime} >= ${inPointMilliseconds} && ${currentTime} <= ${outPointMilliseconds}`
        );

        if (currentTime >= inPointMilliseconds && currentTime <= outPointMilliseconds) {
            console.log('red');

            return FontColor.red;
        } else {
            console.log('black');

            return FontColor.black;
        }
    }, [currentTime]);

    return (
        <Box display={'flex'} sx={{ color: fontColor, mb: 0.5 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', mr: 1 }}>
                {speakerInitials} [{inPointMilliseconds}-{outPointMilliseconds}
                ]:
            </Typography>
            {textItems.map(({ text, languageCode }) => (
                <Typography key={languageCode} variant="body1">
                    "{text}"
                </Typography>
            ))}
        </Box>
    );
};
