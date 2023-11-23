import { ITranscriptItem, ITranscriptParticipant } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { SubtitlesRounded as SubtitlesRoundedIcon } from '@mui/icons-material';
import { Box, Card, CardContent, CardHeader, Divider, Typography } from '@mui/material';

export const TranscriptPresenter = ({ transcript }): JSX.Element => {
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
                {isNullOrUndefined(transcript)
                    ? null
                    : transcript.participants.map((item: ITranscriptParticipant) => (
                          <Box key={item.name.replace(' ', '-')}>
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                  Participants:&nbsp;
                              </Typography>
                              {item.name} ({item.initials})
                          </Box>
                      ))}

                <Divider sx={{ marginY: 2 }} />

                {isNullOrUndefined(transcript)
                    ? null
                    : transcript.items.map((item: ITranscriptItem) => (
                          <Box
                              key={`${item.speakerInitials}-${item.inPointMilliseconds}`}
                              display={'flex'}
                          >
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                  {item.speakerInitials} [{item.inPointMilliseconds}-
                                  {item.outPointMilliseconds}
                                  ]:&nbsp;
                              </Typography>
                              <Typography variant="body1">
                                  {/* TODO: sort out how multilingual text should work here */}
                                  {item.text.items.map((item) => (
                                      <Box key={item.role} component={'span'}>
                                          "{item.text}"
                                      </Box>
                                  ))}
                              </Typography>
                          </Box>
                      ))}
            </CardContent>
        </Card>
    );
};
