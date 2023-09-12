import { ITranscript } from '@coscrad/api-interfaces';
import { SubtitlesRounded as SubtitlesRoundedIcon } from '@mui/icons-material';
import { Box, Card, CardContent, CardHeader, Divider, Typography } from '@mui/material';

interface TranscriptPresenterProps {
    transcript: ITranscript;
    currentTime: number;
}

const compareNumbers = (a, b) => {
    return a - b;
};

export const TranscriptPresenter = ({
    transcript,
    currentTime,
}: TranscriptPresenterProps): JSX.Element => {
    const { participants, items } = transcript;

    // items.sort(compareNumbers);

    // const onHighlight = () => {
    //     return null;
    // };

    // const transcriptIntervalLookupTable = useMemo(() => {
    //     items.reduce(
    //         (accMap, { inPointMilliseconds, outPointMilliseconds, speakerInitials, text }) =>
    //             accMap.set(
    //                 inPointMilliseconds,
    //                 <TranscriptLinePresenter
    //                     key={`${inPointMilliseconds}-${speakerInitials}`}
    //                     transcriptLine={{
    //                         inPointMilliseconds: inPointMilliseconds,
    //                         outPointMilliseconds: outPointMilliseconds,
    //                         speakerInitials: speakerInitials,
    //                         text: text,
    //                     }}
    //                     onHighlight={onHighlight}
    //                 />
    //             ),
    //         new Map()
    //     );
    // }, []);

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
            </CardContent>
        </Card>
    );
};
