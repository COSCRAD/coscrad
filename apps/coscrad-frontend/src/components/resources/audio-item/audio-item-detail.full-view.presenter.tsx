import {
    IAudioItemViewModel,
    ICategorizableDetailQueryResult,
    ITimeRangeContext,
    ResourceType,
} from '@coscrad/api-interfaces';
import { AudioPlayer } from '@coscrad/media-player';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material/';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Divider,
    Grid,
    Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { SinglePropertyPresenter } from '../../../utils/generic-components/presenters/single-property-presenter';
import { findOriginalTextItem } from '../../notes/shared/find-original-text-item';
import { TimeRangeClip, Timeline, buildTimeRangeClip } from '../../timeline';
import { convertMillisecondsToSecondsRounded } from '../utils/math';
import { InteractiveAnnotator } from './interactive-annotator';

const CREATE_NOTE_ABOUT_RESOURCE = 'CREATE_NOTE_ABOUT_RESOURCE';

export const AudioItemDetailFullViewPresenter = ({
    id,
    lengthMilliseconds,
    audioURL,
    text: plainText,
    name,
    actions,
    annotations,
}: ICategorizableDetailQueryResult<IAudioItemViewModel>): JSX.Element => {
    const audioRef = useRef<HTMLAudioElement>(null);

    const [timeRangeClips, setTimeRangeClips] = useState<TimeRangeClip[]>([]);

    const durationSeconds = lengthMilliseconds / 1000;

    useEffect(() => {
        const updatedTimeRangeClips = isNullOrUndefined(audioRef?.current?.currentTime)
            ? []
            : annotations.flatMap(({ connectedResources, id: noteId, note }) => {
                  const timeRangeContext = connectedResources[0].context as ITimeRangeContext;

                  const {
                      timeRange: { inPointMilliseconds, outPointMilliseconds },
                  } = timeRangeContext;

                  const noteOriginal = findOriginalTextItem(note).text;

                  const tipText = `[${inPointMilliseconds} ms to ${outPointMilliseconds}] ${noteOriginal}`;

                  /**
                   * Should we break this logic out so we can share it for
                   * video annotation?
                   */
                  return [
                      buildTimeRangeClip({
                          name: `${noteId}`,
                          noteText: noteOriginal,
                          tip: tipText,
                          inPointMilliseconds: inPointMilliseconds,
                          outPointMilliseconds: outPointMilliseconds,
                          onClick: (inPointSeconds) => {
                              audioRef.current.currentTime = inPointSeconds;
                          },
                      }),
                  ];
              });

        setTimeRangeClips(updatedTimeRangeClips);
    }, [audioRef, annotations]);

    const formatedPlainText = plainText.split('\n').map((line, index) => (
        <Box mb={1} key={index}>
            {line}
        </Box>
    ));

    return (
        <ResourceDetailFullViewPresenter name={name} id={id} type={ResourceType.audioItem}>
            {actions.some(({ type: commandType }) => commandType === CREATE_NOTE_ABOUT_RESOURCE) ? (
                <>
                    <InteractiveAnnotator id={id} audioURL={audioURL} audioRef={audioRef} />
                    <Typography variant="h3">Annotation Track</Typography>
                    <Timeline
                        durationSeconds={durationSeconds}
                        name={`Annotation Track`}
                        timeRangeClips={timeRangeClips}
                    />
                </>
            ) : (
                <AudioPlayer audioUrl={audioURL} />
            )}
            {/* <Typography variant='h3'>Transcript Track</Typography> */}

            <Divider sx={{ mt: 1, mb: 1 }} />
            <Accordion elevation={0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body1" fontWeight="bold">
                        Metadata
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <SinglePropertyPresenter
                        display="Duration"
                        value={`${convertMillisecondsToSecondsRounded(lengthMilliseconds)} secs`}
                    />
                    <SinglePropertyPresenter display="Audio Url" value={audioURL} />
                </AccordionDetails>
            </Accordion>
            <Accordion elevation={0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body1" fontWeight="bold">
                        Transcript Text
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container columns={6} sx={{ mb: 1 }}>
                        <Grid item xs={1}>
                            {/* TODO: introduce bold (not heading) custom theme typography variant? */}
                            <Typography component={'span'} sx={{ fontWeight: 'bold' }}>
                                Text:
                            </Typography>
                        </Grid>
                        <Grid item xs={5}>
                            {formatedPlainText}
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </ResourceDetailFullViewPresenter>
    );
};
