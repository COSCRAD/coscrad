import { SubtitlesRounded } from '@mui/icons-material';
import { Box, Card, CardContent, CardHeader, Divider, Typography } from '@mui/material';

export const TranscriptPresenter = ({ transcript }): JSX.Element => {
    return (
        <Card elevation={0}>
            <CardHeader
                avatar={<SubtitlesRounded color="primary" />}
                title={
                    <Typography variant="h4" margin={'auto 0'}>
                        Transcript
                    </Typography>
                }
            />
            <CardContent>
                {transcript.participants.map((item) => (
                    <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            Participants:&nbsp;
                        </Typography>
                        {item.name} ({item.initials})
                    </Box>
                ))}
                <Divider sx={{ marginY: 2 }} />
                {transcript.items.map((item) => (
                    <Box display={'flex'}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {item.speakerInitials} [{item.inPointMilliseconds}-
                            {item.outPointMilliseconds}
                            ]:&nbsp;
                        </Typography>
                        <Typography variant="body1">
                            {item.text.items.map((item) => (
                                <Box component={'span'}>"{item.text}"</Box>
                            ))}
                        </Typography>
                    </Box>
                ))}
            </CardContent>
        </Card>
    );
};
